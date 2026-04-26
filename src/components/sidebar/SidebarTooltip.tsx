// Floating tooltip for collapsed sidebar icon actions.
import type { SidebarTooltip as SidebarTooltipData } from "../../types/chat";

interface SidebarTooltipProps {
  tooltip: SidebarTooltipData | null;
}

export function SidebarTooltip({ tooltip }: SidebarTooltipProps) {
  if (!tooltip) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
      style={{ top: tooltip.top, left: tooltip.left }}
    >
      {tooltip.label}
    </div>
  );
}
