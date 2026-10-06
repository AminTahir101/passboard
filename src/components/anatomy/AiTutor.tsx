'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';
import type { TutorMode, ViewerAction } from '@/types/anatomy';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface AiTutorProps {
  lang: 'en' | 'ar';
  userId: string;
  nodeId: string | null;
  nodeName?: string;
  tutorMode: TutorMode;
  onModeChange: (mode: TutorMode) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TUTOR_MODES: { value: TutorMode; en: string; ar: string }[] = [
  { value: 'explain',  en: 'Explain',  ar: 'شرح' },
  { value: 'exam',     en: 'Exam',     ar: 'امتحان' },
  { value: 'clinical', en: 'Clinical', ar: 'سريري' },
  { value: 'socratic', en: 'Socratic', ar: 'سقراطي' },
];

export default function AiTutor({
  lang, nodeId, nodeName, tutorMode, onModeChange,
}: AiTutorProps) {
  const { applyViewerActions, tutorSessionId, setTutorSessionId } = useAnatomyStore();
  const isAr = lang === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // When node changes, prepend a context-switch message
  const prevNodeRef = useRef<string | null>(null);
  useEffect(() => {
    if (!nodeId || nodeId === prevNodeRef.current) return;
    prevNodeRef.current = nodeId;
    if (messages.length > 0) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: isAr
            ? `تم تغيير البنية المحددة. الآن تحدثنا عن: **${nodeName ?? nodeId}**`
            : `Structure changed. Now discussing: **${nodeName ?? nodeId}**`,
        },
      ]);
    }
  }, [nodeId, nodeName, isAr, messages.length]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/anatomy/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          sessionId: tutorSessionId,
          nodeId,
          tutorMode,
          lang,
        }),
      });

      if (!res.ok) {
        const { error: e } = await res.json();
        throw new Error(e ?? 'Failed');
      }

      const data = await res.json() as {
        sessionId: string;
        message: string;
        viewerActions?: ViewerAction[];
      };

      if (!tutorSessionId) setTutorSessionId(data.sessionId);
      setMessages((m) => [...m, { role: 'assistant', content: data.message }]);

      if (data.viewerActions?.length) {
        applyViewerActions(data.viewerActions);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, nodeId, tutorMode, lang, tutorSessionId, setTutorSessionId, applyViewerActions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const startGreeting = useCallback(async () => {
    if (!nodeId || messages.length > 0) return;

    const greetings: Record<TutorMode, Record<'en' | 'ar', string>> = {
      explain: {
        en: `Let's explore ${nodeName ?? 'this structure'}. Ask me anything about its anatomy, function, or clinical relevance.`,
        ar: `دعنا نستكشف ${nodeName ?? 'هذه البنية'}. اسألني عن تشريحها أو وظيفتها أو أهميتها السريرية.`,
      },
      exam: {
        en: `Exam mode — I'll test your knowledge of ${nodeName ?? 'this structure'}. Ready?`,
        ar: `وضع الامتحان — سأختبر معلوماتك عن ${nodeName ?? 'هذه البنية'}. هل أنت مستعد؟`,
      },
      clinical: {
        en: `Let's approach ${nodeName ?? 'this structure'} through clinical scenarios. Ready for a case?`,
        ar: `لنتناول ${nodeName ?? 'هذه البنية'} من خلال سيناريوهات سريرية. هل أنت مستعد لحالة؟`,
      },
      socratic: {
        en: `I'll guide you to discover ${nodeName ?? 'this structure'} yourself. What do you already know about it?`,
        ar: `سأرشدك لاكتشاف ${nodeName ?? 'هذه البنية'} بنفسك. ماذا تعرف عنها؟`,
      },
    };

    setMessages([{ role: 'assistant', content: greetings[tutorMode][lang] }]);
  }, [nodeId, nodeName, messages.length, tutorMode, lang]);

  useEffect(() => {
    if (nodeId && messages.length === 0) {
      startGreeting();
    }
  }, [nodeId, messages.length, startGreeting]);

  return (
    <div className="flex flex-col h-full" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Mode selector */}
      <div
        className="flex gap-1 px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {TUTOR_MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
            style={{
              background: tutorMode === m.value ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: tutorMode === m.value ? '#fff' : 'rgba(255,255,255,0.35)',
            }}
          >
            {isAr ? m.ar : m.en}
          </button>
        ))}
      </div>

      {/* No node selected */}
      {!nodeId ? (
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <div>
            <Bot size={28} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 8, margin: '0 auto 8px' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {isAr
                ? 'حدد بنية تشريحية لبدء المحادثة'
                : 'Select a structure to start a conversation'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} isAr={isAr} />
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(229,62,62,0.15)' }}>
                  <Bot size={14} style={{ color: '#fc8181' }} />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((n) => (
                    <div
                      key={n}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'rgba(255,255,255,0.3)', animationDelay: `${n * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs px-2 py-1.5 rounded" style={{ background: 'rgba(229,62,62,0.1)', color: '#fc8181' }}>
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 pb-3 pt-2 shrink-0 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAr ? 'اسألني عن هذه البنية…' : 'Ask about this structure…'}
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  maxHeight: 120,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="shrink-0 p-1.5 rounded-lg transition-all"
                style={{
                  background: input.trim() && !loading ? '#e53e3e' : 'rgba(255,255,255,0.08)',
                  color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.2)',
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <p className="text-xs mt-1.5 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {isAr ? 'Enter للإرسال · Shift+Enter للسطر الجديد' : 'Enter to send · Shift+Enter for new line'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Chat bubble ───────────────────────────────────────────────

function ChatBubble({ msg, isAr }: { msg: ChatMessage; isAr: boolean }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(229,62,62,0.15)',
        }}
      >
        {isUser
          ? <User size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
          : <Bot size={13} style={{ color: '#fc8181' }} />}
      </div>
      <div
        className="rounded-xl px-3 py-2 max-w-[85%] text-xs leading-relaxed"
        style={{
          background: isUser ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <MarkdownLite content={msg.content} />
      </div>
    </div>
  );
}

// ── Minimal markdown renderer ─────────────────────────────────

function MarkdownLite({ content }: { content: string }) {
  // Bold, then render lines
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className={i > 0 ? 'mt-1' : ''}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </>
  );
}
