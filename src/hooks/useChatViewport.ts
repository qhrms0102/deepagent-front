import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";

export function useChatViewport(messages: Message[], input: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reasoningRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [input]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const streamingMessage = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.isStreaming);

    if (!streamingMessage) {
      return;
    }

    const node = reasoningRefs.current[streamingMessage.id];
    if (!node) {
      return;
    }

    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 120;
  };

  const markAutoScroll = () => {
    shouldAutoScrollRef.current = true;
  };

  return {
    textareaRef,
    scrollRef,
    bottomRef,
    reasoningRefs,
    handleScroll,
    markAutoScroll,
  };
}
