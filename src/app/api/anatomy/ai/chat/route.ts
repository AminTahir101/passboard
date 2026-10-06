import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import {
  ANATOMY_SYSTEM_PROMPT,
  buildAnatomyContext,
  type AnatomyContext,
} from '@/lib/anatomy/system-prompt';
import { dbRowToNode, dbRowToContent } from '@/lib/anatomy/db-mappers';
import type { TutorMode } from '@/types/anatomy';

let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000 });
  return openai;
}

interface ChatRequestBody {
  message: string;
  sessionId?: string;
  nodeId?: string | null;
  tutorMode?: TutorMode;
  lang?: 'en' | 'ar';
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check access
    const { data: profile } = await supabase
      .from('profiles')
      .select('access_status, access_expires_at')
      .eq('id', user.id)
      .single();

    if (!profile || profile.access_status !== 'active') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (profile.access_expires_at && new Date(profile.access_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Access expired' }, { status: 403 });
    }

    const body: ChatRequestBody = await req.json();
    const { message, sessionId: incomingSessionId, nodeId, tutorMode = 'explain', lang = 'en' } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Resolve or create tutor session
    let sessionId = incomingSessionId;

    if (!sessionId) {
      const { data: session, error: sessionErr } = await (supabase as any)
        .from('anatomy_tutor_sessions')
        .insert({
          user_id: user.id,
          node_id: nodeId ?? null,
          mode: tutorMode,
          sex_model: 'male',
          messages: [],
        })
        .select('id')
        .single();

      if (sessionErr || !session) {
        return NextResponse.json({ error: 'Failed to create tutor session' }, { status: 500 });
      }
      sessionId = session.id as string;
    } else {
      // Verify ownership
      const { data: existing } = await (supabase as any)
        .from('anatomy_tutor_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    }

    // Fetch last 12 messages from session
    const { data: sessionData } = await (supabase as any)
      .from('anatomy_tutor_sessions')
      .select('messages')
      .eq('id', sessionId)
      .single();

    const history: Array<{ role: string; content: string }> =
      (sessionData?.messages as Array<{ role: string; content: string }> ?? []).slice(-12);

    // Build anatomy context from current node
    let structureContext = '';
    if (nodeId) {
      const { data: nodeRow } = await (supabase as any)
        .from('anatomy_nodes')
        .select('*')
        .eq('id', nodeId)
        .single();

      if (nodeRow) {
        const node = dbRowToNode(nodeRow);
        let content = null;

        const { data: contentRow } = await (supabase as any)
          .from('anatomy_content')
          .select('*')
          .eq('node_id', nodeId)
          .single();

        if (contentRow) content = dbRowToContent(contentRow);

        const ctx: AnatomyContext = {
          nodeName: node.nameEn,
          nodeId: node.id,
          nameLatin: node.nameLatin,
          structureType: node.structureType,
          level: node.level,
          regionTags: node.regionTags,
          systemTags: node.systemTags,
          description: content?.description,
          functionText: content?.functionText,
          arterialSupply: content?.arterialSupply,
          venousDrainage: content?.venousDrainage,
          innervation: content?.innervation,
          clinicalCorrelations: content?.clinicalCorrelations,
          examPoints: content?.examPoints,
          tutorMode,
        };
        structureContext = buildAnatomyContext(ctx);
      }
    }

    // Language instruction
    const langInstruction = lang === 'ar'
      ? 'IMPORTANT: The student is using Arabic. Respond entirely in Arabic using standard medical Arabic terminology.'
      : '';

    // Build messages for OpenAI
    const systemMessages: Array<{ role: 'system'; content: string }> = [
      { role: 'system', content: ANATOMY_SYSTEM_PROMPT },
    ];
    if (structureContext) {
      systemMessages.push({ role: 'system', content: structureContext });
    }
    if (langInstruction) {
      systemMessages.push({ role: 'system', content: langInstruction });
    }

    const conversationMessages = history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const model = process.env.OPENAI_MODEL ?? 'gpt-4o';
    const oai = getOpenAI();

    const completion = await oai.chat.completions.create({
      model,
      messages: [...systemMessages, ...conversationMessages, { role: 'user', content: message }],
      max_tokens: 1200,
      temperature: 0.6,
    });

    const assistantContent = completion.choices[0]?.message?.content
      ?? 'I was unable to generate a response. Please try again.';

    // Extract viewer actions from response
    const viewerActionsMatch = assistantContent.match(/<viewer-actions>([\s\S]*?)<\/viewer-actions>/);
    let viewerActions: unknown[] = [];
    let cleanContent = assistantContent;
    if (viewerActionsMatch) {
      try {
        viewerActions = JSON.parse(viewerActionsMatch[1].trim());
        cleanContent = assistantContent.replace(/<viewer-actions>[\s\S]*?<\/viewer-actions>/, '').trim();
      } catch {
        // malformed — ignore
      }
    }

    // Persist messages to session
    const updatedMessages = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: cleanContent },
    ];

    await (supabase as any)
      .from('anatomy_tutor_sessions')
      .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({
      sessionId,
      message: cleanContent,
      role: 'assistant',
      viewerActions,
    });
  } catch (err) {
    console.error('[anatomy/ai/chat]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
