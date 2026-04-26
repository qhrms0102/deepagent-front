export interface TraceItem {
  id: string;
  call_id?: string;
  kind?: string;
  name?: string;
  title: string;
  status: "running" | "done" | "error";
  summary?: string;
  detail?: string;
  agent_name?: string;
  subagent_name?: string;
  input?: unknown;
  output?: unknown;
  timestamp: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  traces?: TraceItem[];
  isStreaming?: boolean;
}

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionDetail {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: StoredMessage[];
}

export interface SidebarTooltip {
  label: string;
  top: number;
  left: number;
}
