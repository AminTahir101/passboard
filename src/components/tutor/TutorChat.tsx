"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Loader2,
  Bot,
  User,
  BookOpen,
} from "lucide-react";
import type { AiConversation, AiMessage, Question } from "@/types/database";

interface Props {
  conversations: AiConversation[];
  userId: string;
  questionId?: string;
  initialQuestion?: Question | null;
}

const SUGGESTED_PROMPTS = [
  "Teach me a topic",
  "Quiz me on a medical topic",
  "Explain a clinical concept",
  "Give me a clinical case scenario",
  "Explain one of my recent mistakes",
];

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TutorChat({
  conversations: initialConversations,
  userId,
  questionId,
  initialQuestion,
}: Props) {
  const [conversations, setConversations] =
    useState<AiConversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    setActiveConversationId(convId);
    try {
      const res = await fetch(`/api/ai/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  function startNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");

    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      conversation_id: activeConversationId || "",
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: trimmed,
          questionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }

      const data = await res.json();

      const assistantMsg: AiMessage = {
        id: crypto.randomUUID(),
        conversation_id: data.conversationId,
        role: "assistant",
        content: data.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => {
        // update user message with real conversation id
        return prev
          .map((m) =>
            m.id === userMsg.id
              ? { ...m, conversation_id: data.conversationId }
              : m
          )
          .concat(assistantMsg);
      });

      // Update active conversation
      if (!activeConversationId) {
        setActiveConversationId(data.conversationId);
        // Refresh conversation list
        const convRes = await fetch("/api/ai/conversations");
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }
      }
    } catch (err: unknown) {
      const errorMsg: AiMessage = {
        id: crypto.randomUUID(),
        conversation_id: activeConversationId || "",
        role: "assistant",
        content:
          err instanceof Error
            ? err.message
            : "Sorry, something went wrong. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div className="flex h-full" style={{ background: "var(--background)" }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 flex flex-col border-r overflow-hidden transition-all duration-200`}
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--brand)" }}
            >
              <Bot size={15} style={{ color: "var(--brand-foreground)" }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--foreground)" }}
            >
              AI Tutor
            </span>
          </div>
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              background: "var(--background)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--background)";
            }}
          >
            <Plus size={15} />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p
              className="text-xs px-3 py-4 text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                    style={{
                      background:
                        activeConversationId === conv.id
                          ? "var(--muted)"
                          : "transparent",
                      color:
                        activeConversationId === conv.id
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = "var(--muted)";
                        e.currentTarget.style.color = "var(--foreground)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--muted-foreground)";
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare size={13} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-tight">
                          {conv.title || "Untitled conversation"}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {formatTime(conv.updated_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            title="Toggle sidebar"
          >
            <MessageSquare size={17} />
          </button>
          <h1
            className="font-semibold text-base"
            style={{ color: "var(--foreground)" }}
          >
            AI Tutor
          </h1>

          {/* Question context banner */}
          {initialQuestion && (
            <div
              className="flex items-center gap-2 ml-3 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              <BookOpen size={13} />
              <span className="truncate max-w-xs">
                Discussing:{" "}
                <span style={{ color: "var(--foreground)" }}>
                  {initialQuestion.question_text.slice(0, 80)}
                  {initialQuestion.question_text.length > 80 ? "…" : ""}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "var(--muted-foreground)" }}
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--brand)" }}
              >
                <Bot size={28} style={{ color: "var(--brand-foreground)" }} />
              </div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Moraje3 AI Tutor
              </h2>
              <p
                className="text-sm text-center mb-8 max-w-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Your personal medical exam study companion. Ask me anything to
                get started.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-xl">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl text-sm border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--muted)";
                      e.currentTarget.style.borderColor = "var(--brand)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--card)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--secondary)"
                          : "var(--brand)",
                    }}
                  >
                    {msg.role === "user" ? (
                      <User
                        size={14}
                        style={{ color: "var(--foreground)" }}
                      />
                    ) : (
                      <Bot
                        size={14}
                        style={{ color: "var(--brand-foreground)" }}
                      />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                    }`}
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--brand)"
                          : "var(--card)",
                      color:
                        msg.role === "user"
                          ? "var(--brand-foreground)"
                          : "var(--foreground)",
                      border:
                        msg.role === "assistant"
                          ? "1px solid var(--border)"
                          : "none",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--brand)" }}
                  >
                    <Bot
                      size={14}
                      style={{ color: "var(--brand-foreground)" }}
                    />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3 border"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "var(--muted-foreground)",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="shrink-0 px-4 py-4 border-t"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-2 rounded-2xl border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--background)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about medicine or your exam…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{
                  color: "var(--foreground)",
                  minHeight: "24px",
                  maxHeight: "160px",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                style={{
                  background: "var(--brand)",
                  color: "var(--brand-foreground)",
                }}
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
