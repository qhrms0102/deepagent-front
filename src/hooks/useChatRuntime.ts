import { useCallback, useRef, useState } from "react";
import type React from "react";
import type { Message } from "../types/chat";
import { useChatSessions } from "./useChatSessions";
import { useChatStream } from "./useChatStream";
import { useChatViewport } from "./useChatViewport";

export function useChatRuntime(apiBaseUrl: string) {
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const streamControlRef = useRef({
    isLoading: false,
    stopStreaming: () => {},
  });
  const streamDispatchRef = useRef({
    setInput: (_value: string) => {},
    setMessages: (_updater: React.SetStateAction<Message[]>) => {},
  });

  const clearError = useCallback((message: string | null) => {
    setErrorBanner(message);
  }, []);

  const setSessionInput = useCallback((value: string) => {
    streamDispatchRef.current.setInput(value);
  }, []);

  const setSessionMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    streamDispatchRef.current.setMessages(updater);
  }, []);

  const getIsStreaming = useCallback(() => streamControlRef.current.isLoading, []);

  const interruptStreaming = useCallback(() => {
    streamControlRef.current.stopStreaming();
  }, []);

  const {
    sessions,
    currentSessionId,
    isSessionListLoading,
    isSessionLoading,
    refreshSessions,
    ensureSessionId,
    loadSession,
    createNewSession,
    deleteSession,
  } = useChatSessions({
    apiBaseUrl,
    getIsStreaming,
    interruptStreaming,
    onError: clearError,
    setInput: setSessionInput,
    setMessages: setSessionMessages,
  });

  const stream = useChatStream({
    apiBaseUrl,
    ensureSessionId,
    refreshSessions,
    isSessionLoading,
    onError: clearError,
  });

  streamControlRef.current = {
    isLoading: stream.isLoading,
    stopStreaming: stream.stopStreaming,
  };
  streamDispatchRef.current = {
    setInput: stream.setInput,
    setMessages: stream.setMessages,
  };

  const handleSubmit = (event: React.SyntheticEvent, overrideInput?: string) => {
    viewport.markAutoScroll();
    return stream.handleSubmit(event, overrideInput);
  };

  const viewport = useChatViewport(stream.messages, stream.input);

  const canSend =
    stream.input.trim().length > 0 &&
    !stream.isLoading &&
    !isSessionLoading &&
    !isSessionListLoading;

  return {
    messages: stream.messages,
    sessions,
    currentSessionId,
    input: stream.input,
    isLoading: stream.isLoading,
    isSessionListLoading,
    isSessionLoading,
    errorBanner,
    textareaRef: viewport.textareaRef,
    scrollRef: viewport.scrollRef,
    bottomRef: viewport.bottomRef,
    reasoningRefs: viewport.reasoningRefs,
    canSend,
    setInput: stream.setInput,
    handleScroll: viewport.handleScroll,
    handleSubmit,
    handleComposerKeyDown: stream.handleComposerKeyDown,
    stopStreaming: stream.stopStreaming,
    loadSession,
    createNewSession,
    deleteSession,
  };
}
