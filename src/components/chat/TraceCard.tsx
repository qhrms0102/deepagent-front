import { TraceMetaRows } from "./TraceMetaRows";
import type { TraceItem } from "../../types/chat";
import {
  getTraceAgentBadge,
  getTraceDetailText,
  getTraceKind,
  getTraceLabel,
  getTraceMetaItems,
  getTracePhaseLabel,
  getTracePrimaryText,
  pretty,
  traceKindClassName,
  tracePhaseClassName,
} from "../../utils/trace";

interface TraceCardProps {
  trace: TraceItem;
  animated?: boolean;
  compact?: boolean;
}

export function TraceCard({ trace, animated = false, compact = false }: TraceCardProps) {
  const metaItems = getTraceMetaItems(trace);
  const showPrimaryText = trace.name === "task" || metaItems.length === 0;
  const agentBadge = getTraceAgentBadge(trace);
  const phaseLabel = getTracePhaseLabel(trace);

  return (
    <div
      key={animated ? `${trace.id}-${trace.kind}-${trace.status}` : trace.id}
      className={`${animated ? "reasoning-brief " : ""}rounded-[1rem] border border-slate-200 bg-white ${compact ? "p-3 shadow-sm" : "px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={compact ? "font-medium text-slate-900" : "text-base font-semibold text-slate-950"}>
            {getTraceLabel(trace)}
          </div>
          {agentBadge ? (
            <div className="mt-2">
              <span className="rounded-xl bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-900">
                {agentBadge}
              </span>
            </div>
          ) : null}
          {showPrimaryText ? (
            <div
              className={`mt-2 text-sm leading-6 ${compact ? "text-slate-600" : "text-slate-700"}`}
              title={getTraceDetailText(trace)}
            >
              {getTracePrimaryText(trace)}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <span
            className={`inline-flex rounded-xl px-2.5 py-1 text-[10px] font-semibold ${traceKindClassName[getTraceKind(trace)]}`}
          >
            {getTraceKind(trace)}
          </span>
          {phaseLabel ? (
            <span
              className={`inline-flex rounded-xl px-2.5 py-1 text-[10px] font-semibold ${tracePhaseClassName}`}
            >
              {phaseLabel}
            </span>
          ) : null}
        </div>
      </div>

      <TraceMetaRows items={metaItems} id={trace.id} />

      {compact && (Boolean(trace.input) || Boolean(trace.output)) ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            raw payload
          </summary>
          <div className="mt-2 grid gap-2">
            {trace.input ? (
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {pretty(trace.input)}
              </pre>
            ) : null}
            {trace.output ? (
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {pretty(trace.output)}
              </pre>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}
