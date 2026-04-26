import { useState } from "react";
import type { SidebarTooltip } from "../types/chat";

export function useSidebarTooltip() {
  const [sidebarTooltip, setSidebarTooltip] = useState<SidebarTooltip | null>(null);

  const showSidebarTooltip = (label: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setSidebarTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideSidebarTooltip = () => {
    setSidebarTooltip(null);
  };

  return {
    sidebarTooltip,
    showSidebarTooltip,
    hideSidebarTooltip,
  };
}
