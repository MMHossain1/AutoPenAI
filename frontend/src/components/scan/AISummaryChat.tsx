"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSavedSummary, storeSummary, streamSummary, streamChat } from "@/features/scans/api/ai.api";
import type { ChatMessage, SummaryType } from "@/features/scans/types";
import ReactMarkdown from "react-markdown";

type AISummaryChatProps = {
  scanUrl: string;
  scanStatus: "idle" | "running" | "done" | "stopped" | "error";
  scanId?: number;
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-bold first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        code: ({ children, className: codeClassName }) => {
          const isBlock = codeClassName?.includes("language-");
          if (isBlock) {
            return (
              <pre className="my-2 overflow-x-auto rounded-md bg-slate-800 p-3 text-xs text-slate-200 dark:bg-slate-900">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-700">
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-slate-300 pl-3 italic text-slate-600 dark:border-slate-600 dark:text-slate-400">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-slate-200 dark:border-slate-700" />,
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="min-w-full text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left font-semibold dark:border-slate-600 dark:bg-slate-800">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-300 px-2 py-1 dark:border-slate-600">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function AISummaryChat({ scanUrl, scanStatus, scanId }: AISummaryChatProps) {
  const [summaryType, setSummaryType] = useState<SummaryType>("non-technical");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const summaryAbortRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasFetchedRef = useRef(false);
  // Always holds the latest scanId so streaming callbacks can read it without closure staleness
  const scanIdRef = useRef(scanId);
  useEffect(() => { scanIdRef.current = scanId; }, [scanId]);

  const scanDone = scanStatus === "done" || scanStatus === "stopped";
  const chatEnabled = scanDone && !summaryLoading;

  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse, scrollToBottom]);

  const loadSummary = useCallback(
    async (type: SummaryType) => {
      summaryAbortRef.current?.abort();
      const controller = new AbortController();
      summaryAbortRef.current = controller;

      setSummaryLoading(true);
      setSummary("");

      try {
        // Try to load a previously saved summary first
        if (scanId != null) {
          const saved = await getSavedSummary(scanId, type);
          if (saved) {
            setSummary(saved.content);
            setSummaryLoading(false);
            return;
          }
        }

        // No saved summary — generate via LLM and persist
        let accumulated = "";
        for await (const event of streamSummary(scanUrl, type, controller.signal, scanId)) {
          if (event.type === "token") {
            accumulated += event.content;
            setSummary(accumulated);
          } else if (event.type === "done") {
            break;
          }
        }
        // Read scanId from ref — it may have arrived while the LLM was streaming
        if (accumulated && scanIdRef.current != null) {
          void storeSummary(scanIdRef.current, type, accumulated).catch(() => {});
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const msg = err instanceof Error ? err.message : "Failed to load summary";
          setSummary(`Error: ${msg}`);
        }
      } finally {
        setSummaryLoading(false);
      }
    },
    [scanUrl, scanId]
  );

  // Fetch summary when scan completes
  useEffect(() => {
    if (!scanDone || !scanUrl || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void loadSummary(summaryType);
  }, [scanDone, scanUrl, summaryType, loadSummary]);

  const handleTypeToggle = useCallback(
    (type: SummaryType) => {
      if (type === summaryType || !scanDone) return;
      setSummaryType(type);
      setMessages([]);
      setCurrentResponse("");
      void loadSummary(type);
    },
    [summaryType, scanDone, loadSummary]
  );

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming || !chatEnabled) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsStreaming(true);
    setCurrentResponse("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let accumulated = "";
      for await (const event of streamChat(scanUrl, updatedMessages, summaryType, controller.signal)) {
        if (event.type === "token") {
          accumulated += event.content;
          setCurrentResponse(accumulated);
        } else if (event.type === "done") {
          break;
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      setCurrentResponse("");
    } catch (err) {
      if (!controller.signal.aborted) {
        const msg = err instanceof Error ? err.message : "Failed to get response";
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }]);
        setCurrentResponse("");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [inputValue, isStreaming, chatEnabled, messages, scanUrl, summaryType]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    if (currentResponse) {
      setMessages((prev) => [...prev, { role: "assistant", content: currentResponse }]);
      setCurrentResponse("");
    }
    setIsStreaming(false);
  }, [currentResponse]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      summaryAbortRef.current?.abort();
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="mt-6 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1a2332]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-blue-500 dark:text-blue-400">psychology</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Analysis</h3>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            onClick={() => handleTypeToggle("non-technical")}
            disabled={!scanDone}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${summaryType === "non-technical"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            Non-Technical
          </button>
          <button
            onClick={() => handleTypeToggle("technical")}
            disabled={!scanDone}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${summaryType === "technical"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            Technical
          </button>
        </div>
      </div>

      {/* Summary section */}
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-slate-400">summarize</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Summary</span>
          {summaryLoading && summary && (
            <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-blue-500" />
          )}
          {summaryLoading && (
            <button
              onClick={() => summaryAbortRef.current?.abort()}
              className="ml-auto flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <span className="material-symbols-outlined text-[14px]">stop</span>
              Stop
            </button>
          )}
        </div>

        {!scanDone ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined mb-2 text-[32px]">hourglass_empty</span>
            <p className="text-sm">Waiting for scan to complete...</p>
            <p className="mt-1 text-xs">The AI summary will appear here once results are available.</p>
          </div>
        ) : summaryLoading && !summary ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <MarkdownContent content={summary} />
          </div>
        )}
      </div>

      {/* Chat section — visually separated */}
      <div className="mx-4 mb-4 flex flex-col rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40">
        {/* Chat header */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
          <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500">chat</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Follow-up Chat</span>
          {!chatEnabled && (
            <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
              {scanDone ? "Loading summary..." : "Available after scan completes"}
            </span>
          )}
        </div>

        {/* Chat messages */}
        <div className="flex max-h-72 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && !currentResponse && (
            <p className="py-2 text-center text-xs text-slate-400 dark:text-slate-500">
              {chatEnabled
                ? "Ask follow-up questions about the scan results"
                : "Chat will be available once the summary is ready"}
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                  }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownContent content={msg.content} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {currentResponse && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <MarkdownContent content={currentResponse} />
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-slate-500" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} className="h-1" />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2.5 dark:border-slate-700">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            placeholder={chatEnabled ? "Ask about the scan results..." : "Waiting for scan..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!chatEnabled || isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
            </button>
          ) : (
            <button
              onClick={() => void sendMessage()}
              disabled={!chatEnabled || !inputValue.trim()}
              className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
