import { useEffect, useState } from "react";
import type React from "react";
import { SESSION_STORAGE_KEY } from "../constants/chat";
import type { Message, SessionDetail, SessionSummary } from "../types/chat";
import { mapStoredMessages } from "../utils/session";

interface UseChatSessionsOptions {
  apiBaseUrl: string;
  getIsStreaming: () => boolean;
  interruptStreaming: () => void;
  onError: (message: string | null) => void;
  setInput: (value: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChatSessions({
  apiBaseUrl,
  getIsStreaming,
  interruptStreaming,
  onError,
  setInput,
  setMessages,
}: UseChatSessionsOptions) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSessionListLoading, setIsSessionListLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      setIsSessionListLoading(true);
      onError(null);

      try {
        const res = await fetch(`${apiBaseUrl}/api/sessions`);
        if (!res.ok) {
          throw new Error(`세션 목록 조회 실패: ${res.status}`);
        }

        const data = (await res.json()) as { sessions: SessionSummary[] };
        if (isCancelled) {
          return;
        }

        const nextSessions = data.sessions || [];
        setSessions(nextSessions);

        const savedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
        const targetSessionId =
          nextSessions.find((session) => session.id === savedSessionId)?.id ??
          nextSessions[0]?.id ??
          null;

        if (targetSessionId) {
          setCurrentSessionId(targetSessionId);
          window.localStorage.setItem(SESSION_STORAGE_KEY, targetSessionId);

          setIsSessionLoading(true);
          const sessionRes = await fetch(`${apiBaseUrl}/api/sessions/${targetSessionId}`);
          if (!sessionRes.ok) {
            throw new Error(`대화 조회 실패: ${sessionRes.status}`);
          }

          const session = (await sessionRes.json()) as SessionDetail;
          if (!isCancelled) {
            setMessages(mapStoredMessages(session.messages || []));
          }
          setIsSessionLoading(false);
          return;
        }

        const createRes = await fetch(`${apiBaseUrl}/api/sessions`, { method: "POST" });
        if (!createRes.ok) {
          throw new Error(`세션 생성 실패: ${createRes.status}`);
        }

        const created = (await createRes.json()) as SessionDetail;
        if (isCancelled) {
          return;
        }

        setCurrentSessionId(created.id);
        setMessages([]);
        window.localStorage.setItem(SESSION_STORAGE_KEY, created.id);
        setSessions([
          {
            id: created.id,
            title: created.title,
            preview: "",
            created_at: created.created_at,
            updated_at: created.updated_at,
            message_count: 0,
          },
        ]);
      } catch (error) {
        if (!isCancelled) {
          onError(error instanceof Error ? error.message : "세션을 불러오지 못했습니다.");
        }
      } finally {
        if (!isCancelled) {
          setIsSessionListLoading(false);
          setIsSessionLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, [apiBaseUrl, onError, setMessages]);

  const refreshSessions = async (preferredSessionId?: string) => {
    const res = await fetch(`${apiBaseUrl}/api/sessions`);
    if (!res.ok) {
      throw new Error(`세션 목록 조회 실패: ${res.status}`);
    }

    const data = (await res.json()) as { sessions: SessionSummary[] };
    setSessions(data.sessions || []);

    const nextCurrentSessionId =
      preferredSessionId ??
      currentSessionId ??
      data.sessions?.[0]?.id ??
      null;

    if (nextCurrentSessionId) {
      setCurrentSessionId(nextCurrentSessionId);
      window.localStorage.setItem(SESSION_STORAGE_KEY, nextCurrentSessionId);
    }
  };

  const ensureSessionId = async () => {
    if (currentSessionId) {
      return currentSessionId;
    }

    const res = await fetch(`${apiBaseUrl}/api/sessions`, { method: "POST" });
    if (!res.ok) {
      throw new Error(`세션 생성 실패: ${res.status}`);
    }

    const created = (await res.json()) as SessionDetail;
    setCurrentSessionId(created.id);
    window.localStorage.setItem(SESSION_STORAGE_KEY, created.id);
    await refreshSessions(created.id);
    return created.id;
  };

  const interruptIfNeeded = () => {
    if (getIsStreaming()) {
      interruptStreaming();
    }
  };

  const loadSession = async (sessionId: string) => {
    interruptIfNeeded();
    setIsSessionLoading(true);
    onError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/sessions/${sessionId}`);
      if (!res.ok) {
        throw new Error(`대화 조회 실패: ${res.status}`);
      }

      const session = (await res.json()) as SessionDetail;
      setMessages(mapStoredMessages(session.messages || []));
      setCurrentSessionId(sessionId);
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch (error) {
      onError(error instanceof Error ? error.message : "대화를 불러오지 못했습니다.");
    } finally {
      setIsSessionLoading(false);
    }
  };

  const createNewSession = async () => {
    interruptIfNeeded();
    setIsSessionLoading(true);
    onError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/sessions`, { method: "POST" });
      if (!res.ok) {
        throw new Error(`세션 생성 실패: ${res.status}`);
      }

      const created = (await res.json()) as SessionDetail;
      setCurrentSessionId(created.id);
      setMessages([]);
      setInput("");
      window.localStorage.setItem(SESSION_STORAGE_KEY, created.id);
      await refreshSessions(created.id);
    } catch (error) {
      onError(error instanceof Error ? error.message : "새 대화를 만들지 못했습니다.");
    } finally {
      setIsSessionLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (getIsStreaming() && sessionId === currentSessionId) {
      interruptStreaming();
    }

    setIsSessionLoading(true);
    onError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`세션 삭제 실패: ${res.status}`);
      }

      const nextSessions = sessions.filter((session) => session.id !== sessionId);
      setSessions(nextSessions);

      if (sessionId !== currentSessionId) {
        return;
      }

      const nextSession = nextSessions[0];
      if (nextSession) {
        const sessionRes = await fetch(`${apiBaseUrl}/api/sessions/${nextSession.id}`);
        if (!sessionRes.ok) {
          throw new Error(`대화 조회 실패: ${sessionRes.status}`);
        }

        const session = (await sessionRes.json()) as SessionDetail;
        setMessages(mapStoredMessages(session.messages || []));
        setCurrentSessionId(nextSession.id);
        window.localStorage.setItem(SESSION_STORAGE_KEY, nextSession.id);
        return;
      }

      const createRes = await fetch(`${apiBaseUrl}/api/sessions`, { method: "POST" });
      if (!createRes.ok) {
        throw new Error(`세션 생성 실패: ${createRes.status}`);
      }

      const created = (await createRes.json()) as SessionDetail;
      setCurrentSessionId(created.id);
      setMessages([]);
      setInput("");
      window.localStorage.setItem(SESSION_STORAGE_KEY, created.id);
      await refreshSessions(created.id);
    } catch (error) {
      onError(error instanceof Error ? error.message : "세션을 삭제하지 못했습니다.");
      await refreshSessions().catch(() => undefined);
    } finally {
      setIsSessionLoading(false);
    }
  };

  return {
    sessions,
    currentSessionId,
    isSessionListLoading,
    isSessionLoading,
    refreshSessions,
    ensureSessionId,
    loadSession,
    createNewSession,
    deleteSession,
  };
}
