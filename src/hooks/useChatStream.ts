import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { Message, TraceItem } from "../types/chat";
import { createId } from "../utils/session";

interface UseChatStreamOptions {
  apiBaseUrl: string;
  ensureSessionId: () => Promise<string>;
  refreshSessions: (preferredSessionId?: string) => Promise<void>;
  isSessionLoading: boolean;
  onError: (message: string | null) => void;
  onBeforeSubmit?: () => void;
}

export function useChatStream({
  apiBaseUrl,
  ensureSessionId,
  refreshSessions,
  isSessionLoading,
  onError,
  onBeforeSubmit,
}: UseChatStreamOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef<Record<string, string>>({});
  const streamFlushFrameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (streamFlushFrameRef.current !== null) {
        window.cancelAnimationFrame(streamFlushFrameRef.current);
      }
    },
    [],
  );

  const appendTrace = (assistantId: string, trace: Omit<TraceItem, "id" | "timestamp">) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== assistantId) {
          return message;
        }

        const isFirstTrace = (message.traces?.length || 0) === 0;

        return {
          ...message,
          content: isFirstTrace ? "" : message.content,
          traces: [
            ...(message.traces || []),
            {
              ...trace,
              id: createId(),
              timestamp: Date.now(),
            },
          ],
        };
      }),
    );
  };

  const flushStreamBuffer = () => {
    const pendingEntries = Object.entries(streamBufferRef.current);
    streamFlushFrameRef.current = null;

    if (!pendingEntries.length) {
      return;
    }

    streamBufferRef.current = {};

    setMessages((prev) =>
      prev.map((message) => {
        const pendingChunk = pendingEntries.find(([id]) => id === message.id)?.[1];
        if (!pendingChunk) {
          return message;
        }

        return { ...message, content: message.content + pendingChunk };
      }),
    );
  };

  const enqueueStreamChunk = (assistantId: string, content: string) => {
    streamBufferRef.current[assistantId] =
      (streamBufferRef.current[assistantId] || "") + content;

    if (streamFlushFrameRef.current !== null) {
      return;
    }

    streamFlushFrameRef.current = window.requestAnimationFrame(flushStreamBuffer);
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((message) =>
        message.isStreaming
          ? {
              ...message,
              isStreaming: false,
              content: message.content || "응답 생성을 중단했습니다.",
            }
          : message,
      ),
    );
  };

  const handleSubmit = async (event: React.SyntheticEvent, overrideInput?: string) => {
    event.preventDefault();

    const nextInput = (overrideInput ?? input).trim();
    if (!nextInput || isLoading || isSessionLoading) {
      return;
    }

    onBeforeSubmit?.();
    onError(null);

    const sessionId = await ensureSessionId();
    const now = Date.now();
    const userMessage: Message = {
      id: `${now}`,
      role: "user",
      content: nextInput,
    };

    const assistantId = `${now}-assistant`;
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      traces: [],
      isStreaming: true,
    };

    const controller = new AbortController();
    abortRef.current = controller;
    streamBufferRef.current[assistantId] = "";

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMessage.content }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`요청 실패: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const line = evt.replace(/^data:\s*/, "").trim();
          if (!line) {
            continue;
          }

          const parsed = JSON.parse(line);

          if (parsed.type === "chunk") {
            enqueueStreamChunk(assistantId, parsed.content);
          }

          if (parsed.type === "trace") {
            appendTrace(assistantId, parsed.trace);
          }

          if (parsed.type === "error") {
            appendTrace(assistantId, {
              title: "stream_error",
              status: "error",
              summary: parsed.content,
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message =
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

      onError(message);
      setMessages((prev) =>
        prev.map((messageItem) =>
          messageItem.id === assistantId
            ? {
                ...messageItem,
                content: messageItem.content || "요청 처리 중 오류가 발생했습니다.",
                traces: [
                  ...(messageItem.traces || []),
                  {
                    id: createId(),
                    title: "network_error",
                    status: "error",
                    summary: message,
                    timestamp: Date.now(),
                  },
                ],
              }
            : messageItem,
        ),
      );
    } finally {
      flushStreamBuffer();
      delete streamBufferRef.current[assistantId];
      abortRef.current = null;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, isStreaming: false } : message,
        ),
      );
      setIsLoading(false);

      try {
        await refreshSessions(sessionId);
      } catch {
        // Keep the active conversation visible even if the sidebar refresh fails.
      }
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event);
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    stopStreaming,
    handleSubmit,
    handleComposerKeyDown,
  };
}
