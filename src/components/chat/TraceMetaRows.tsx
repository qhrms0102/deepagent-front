import { FiArrowRight, FiCornerDownRight } from "react-icons/fi";

const getTraceMetaIcon = (label: string) => {
  if (label === "입력" || label === "지시" || label === "위임") {
    return <FiCornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />;
  }

  return <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />;
};

interface TraceMetaRowsProps {
  items: Array<{ label: string; value: string; detail?: string }>;
  id: string;
}

export function TraceMetaRows({ items, id }: TraceMetaRowsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
        <div
          key={`${id}-${item.label}`}
          className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
        >
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
            {getTraceMetaIcon(item.label)}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {item.label}
            </div>
            <div className="mt-0.5 break-words leading-6" title={item.detail || item.value}>
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
