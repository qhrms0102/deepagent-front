import type React from "react";
import ReactMarkdown from "react-markdown";
import { FiList } from "react-icons/fi";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types/chat";
import { buildTraceCards, normalizeMarkdown } from "../../utils/trace";
import { TraceCard } from "./TraceCard";

interface MessageListProps {
  messages: Message[];
  reasoningRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export function MessageList({ messages, reasoningRefs }: MessageListProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {messages.map((message) => {
        const traceCards = buildTraceCards(message.traces || []);
        const currentTrace = traceCards[traceCards.length - 1];

        return (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={message.role === "assistant" ? "w-full max-w-[52rem]" : "w-full"}>
              <div
                className={`px-4 py-4 sm:px-5 ${
                  message.role === "user"
                    ? "ml-auto max-w-[38rem] rounded-[1.35rem] bg-slate-950 text-white shadow-sm"
                    : "bg-transparent text-slate-900"
                }`}
              >
                {message.role === "assistant" && traceCards.length > 0 ? (
                  message.isStreaming ? (
                    <div
                      ref={(node) => {
                        reasoningRefs.current[message.id] = node;
                      }}
                      className="mb-4"
                    >
                      {currentTrace ? <TraceCard trace={currentTrace} animated /> : null}
                    </div>
                  ) : (
                    <details className="mb-4">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                        <FiList className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>작업 기록 보기 ({traceCards.length})</span>
                      </summary>
                      <div className="mt-3 space-y-3">
                        {traceCards.map((trace) => (
                          <TraceCard key={trace.id} trace={trace} compact />
                        ))}
                      </div>
                    </details>
                  )
                ) : null}

                {message.role === "assistant" ? (
                  <div className="markdown-body text-[15px] leading-6 text-slate-800">
                    {message.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {normalizeMarkdown(message.content)}
                      </ReactMarkdown>
                    ) : message.isStreaming ? (
                      <span className="text-slate-400">응답 생성 중...</span>
                    ) : null}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-6">{message.content}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
