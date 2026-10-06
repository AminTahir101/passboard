import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbRowToNode, dbRowToContent } from '@/lib/anatomy/db-mappers';
import type { AnatomyNode, AnatomyContent } from '@/types/anatomy';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: nodeData, error: nodeErr } = await (supabase as any)
      .from('anatomy_nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (nodeErr || !nodeData) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const node: AnatomyNode = dbRowToNode(nodeData);

    let content: AnatomyContent | null = null;
    if (nodeData.content_id) {
      const { data: contentData } = await (supabase as any)
        .from('anatomy_content')
        .select('*')
        .eq('node_id', id)
        .single();
      if (contentData) content = dbRowToContent(contentData);
    }

    return NextResponse.json({ node, content });
  } catch (err) {
    console.error('[anatomy/nodes/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
