import type { Message, StoredMessage, TraceItem } from "../types/chat";

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const mapStoredTrace = (trace: TraceItem): TraceItem => ({
  ...trace,
  id: trace.id || createId(),
  timestamp: trace.timestamp || Date.now(),
});

export const mapStoredMessages = (messages: StoredMessage[]): Message[] =>
  messages.map((message) => ({
    id: createId(),
    role: message.role,
    content: message.content,
    traces: message.traces?.map(mapStoredTrace),
  }));

export const formatSessionTime = (value: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
