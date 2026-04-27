import type { TraceItem } from "../types/chat";

export const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export const normalizeMarkdown = (content: string) => content.replace(/\\([*_`~])/g, "$1");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const traceKindClassName = {
  subagent: "bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-300/80",
  tool: "bg-violet-100 text-violet-900 ring-1 ring-inset ring-violet-300/80",
  chain: "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300/80",
  retriever: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300/80",
};

export const tracePhaseClassName =
  "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";

export const summarizeInput = (input: unknown) => {
  if (!isRecord(input)) {
    return null;
  }

  if (typeof input.subagent_type === "string" && typeof input.description === "string") {
    return input.description;
  }

  if (typeof input.city === "string") {
    return `city=${input.city}`;
  }

  if (typeof input.temp_c === "number" && typeof input.cond === "string") {
    return `${input.temp_c}°C, ${input.cond}`;
  }

  if (typeof input.description === "string") {
    return input.description;
  }

  const entries = Object.entries(input)
    .flatMap(([key, value]) => {
      if (value == null) {
        return [];
      }

      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${key}=${String(value)}`;
      }

      return [];
    })
    .slice(0, 3);

  return entries.length ? entries.join(", ") : null;
};

const normalizeTraceContent = (content: string) =>
  content
    .replace(/\\n/g, "\n")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .trim();

export const extractMessageContent = (content: string) => {
  const patterns = [
    /ToolMessage\(content=(['"])((?:\\.|[\s\S])*?)\1/,
    /content=(['"])((?:\\.|[\s\S])*?)\1/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[2]) {
      return normalizeTraceContent(match[2]);
    }
  }

  return normalizeTraceContent(content);
};

export const summarizeOutput = (output: unknown) => {
  if (!isRecord(output)) {
    return null;
  }

  if (
    typeof output.cond === "string" &&
    typeof output.temp === "number" &&
    typeof output.unit === "string"
  ) {
    return `${output.cond}, ${output.temp}°${output.unit}`;
  }

  if (typeof output.cond === "string" && typeof output.temp_c === "number") {
    return `${output.cond}, ${output.temp_c}°C`;
  }

  return null;
};

export const getTraceLabel = (trace: TraceItem) => {
  if (trace.name === "task" && trace.subagent_name) {
    return trace.subagent_name;
  }

  return trace.name || trace.title;
};

export const getTraceAgentBadge = (trace: TraceItem) => {
  if (trace.name === "task") {
    return null;
  }

  if (getTraceKind(trace) === "tool" && trace.agent_name && trace.agent_name !== "main-agent") {
    return `via ${trace.agent_name}`;
  }

  return null;
};

export const getTraceKind = (trace: TraceItem): "subagent" | "tool" | "chain" | "retriever" => {
  if (trace.name === "task") {
    return "subagent";
  }

  if (trace.kind?.startsWith("chain_")) {
    return "chain";
  }

  if (trace.kind?.startsWith("retriever_")) {
    return "retriever";
  }

  return "tool";
};

export const getTracePhaseLabel = (trace: TraceItem) => {
  if (trace.kind?.endsWith("_end")) {
    return "결과";
  }

  if (trace.status === "error") {
    return "오류";
  }

  if (trace.kind?.endsWith("_start")) {
    return trace.kind.startsWith("chain_") ? "지시" : "시작";
  }

  if (trace.name !== "task") {
    return null;
  }

  return "지시";
};

export const getTracePrimaryText = (trace: TraceItem) => {
  const inputSummary = summarizeInput(trace.input);
  const outputSummary = summarizeOutput(trace.output);

  if (trace.name === "task") {
    if (trace.kind === "tool_end") {
      return trace.summary
        ? extractMessageContent(trace.summary)
        : "서브 에이전트가 결과를 반환했습니다.";
    }

    if (trace.status === "running") {
      return inputSummary || "서브 에이전트에 작업을 위임하고 있습니다.";
    }

    if (trace.status === "error") {
      return trace.summary || "서브 에이전트 위임 중 오류가 발생했습니다.";
    }

    return trace.summary || "서브 에이전트 작업이 완료되었습니다.";
  }

  if (trace.status === "running") {
    if (trace.kind?.startsWith("chain_")) {
      return inputSummary || "그래프 단계에 진입했습니다.";
    }

    if (trace.kind?.startsWith("retriever_")) {
      return inputSummary || "문서를 검색하고 있습니다.";
    }

    return inputSummary || "도구를 호출하고 있습니다.";
  }

  if (trace.status === "error") {
    return trace.summary || inputSummary || "호출에 실패했습니다.";
  }

  if (trace.kind?.startsWith("chain_")) {
    return outputSummary || trace.summary || "그래프 단계가 완료되었습니다.";
  }

  if (trace.kind?.startsWith("retriever_")) {
    return outputSummary || trace.summary || "문서 검색이 완료되었습니다.";
  }

  return outputSummary || trace.summary || "호출이 완료되었습니다.";
};

export const getTraceDetailText = (trace: TraceItem) => {
  if (trace.detail) {
    return extractMessageContent(trace.detail);
  }

  if (trace.name === "task" && trace.kind === "tool_end" && trace.summary) {
    return extractMessageContent(trace.summary);
  }

  return getTracePrimaryText(trace);
};

export const getTraceMetaItems = (trace: TraceItem) => {
  const items: Array<{ label: string; value: string; detail?: string }> = [];
  const inputSummary = summarizeInput(trace.input);
  const outputSummary = summarizeOutput(trace.output);

  if (trace.name === "task") {
    return [];
  }

  if (inputSummary) {
    items.push({ label: "입력", value: inputSummary, detail: inputSummary });
  }

  if (trace.status === "done" && outputSummary) {
    items.push({ label: "출력", value: outputSummary, detail: outputSummary });
  } else if (trace.status === "done" && trace.summary && trace.summary !== outputSummary) {
    items.push({
      label: "요약",
      value: trace.summary,
      detail: trace.detail ? extractMessageContent(trace.detail) : extractMessageContent(trace.summary),
    });
  } else if (trace.status === "error" && trace.summary && trace.summary !== inputSummary) {
    items.push({ label: "오류", value: trace.summary, detail: trace.summary });
  }

  return items.slice(0, 2);
};

const isStartEndPair = (startTrace: TraceItem, endTrace: TraceItem) => {
  if (!startTrace.kind?.endsWith("_start") || !endTrace.kind?.endsWith("_end")) {
    return false;
  }

  const startPrefix = startTrace.kind.replace(/_start$/, "");
  const endPrefix = endTrace.kind.replace(/_end$/, "");

  return startPrefix === endPrefix && (startTrace.call_id || startTrace.id) === (endTrace.call_id || endTrace.id);
};

const mergeTracePair = (startTrace: TraceItem, endTrace: TraceItem): TraceItem => ({
  ...startTrace,
  ...endTrace,
  input: startTrace.input ?? endTrace.input,
  output: endTrace.output ?? startTrace.output,
  summary: endTrace.summary ?? startTrace.summary,
  detail: endTrace.detail ?? startTrace.detail,
  timestamp: startTrace.timestamp,
});

export const buildTraceCards = (traces: TraceItem[]) => {
  const cards: TraceItem[] = [];
  const toolCardIndexByCallId = new Map<string, number>();

  for (const trace of traces) {
    if (trace.kind?.startsWith("tool_")) {
      const key = trace.call_id || trace.id;
      const existingIndex = toolCardIndexByCallId.get(key);

      if (existingIndex !== undefined) {
        cards[existingIndex] = mergeTracePair(cards[existingIndex], trace);
        continue;
      }

      toolCardIndexByCallId.set(key, cards.length);
      cards.push({ ...trace });
      continue;
    }

    const previous = cards[cards.length - 1];

    if (previous && isStartEndPair(previous, trace)) {
      cards[cards.length - 1] = mergeTracePair(previous, trace);
      continue;
    }

    cards.push({ ...trace });
  }

  return cards.sort((a, b) => a.timestamp - b.timestamp);
};
