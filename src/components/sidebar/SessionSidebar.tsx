import { GiBatBlade } from "react-icons/gi";
import { FiChevronLeft, FiChevronRight, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { SessionSummary } from "../../types/chat";
import { formatSessionTime } from "../../utils/session";

interface SessionSidebarProps {
  currentSessionId: string | null;
  isLoading: boolean;
  isSessionListLoading: boolean;
  isSessionLoading: boolean;
  isSidebarOpen: boolean;
  sessions: SessionSummary[];
  onCreateSession: () => void | Promise<void>;
  onDeleteSession: (sessionId: string) => void | Promise<void>;
  onLoadSession: (sessionId: string) => void | Promise<void>;
  onOpenChange: (isOpen: boolean) => void;
  onShowTooltip: (label: string, element: HTMLElement) => void;
  onHideTooltip: () => void;
}

export function SessionSidebar({
  currentSessionId,
  isLoading,
  isSessionListLoading,
  isSessionLoading,
  isSidebarOpen,
  sessions,
  onCreateSession,
  onDeleteSession,
  onLoadSession,
  onOpenChange,
  onShowTooltip,
  onHideTooltip,
}: SessionSidebarProps) {
  return (
    <>
      <div
        className={`relative flex h-16 items-center ${
          isSidebarOpen ? "justify-between px-4" : "justify-center px-0"
        }`}
      >
        <button
          type="button"
          aria-label={isSidebarOpen ? "Deep Agent" : "사이드바 펼치기"}
          onClick={() => {
            if (!isSidebarOpen) {
              onOpenChange(true);
            }
          }}
          onMouseEnter={(event) => {
            if (!isSidebarOpen) {
              onShowTooltip("사이드바 펼치기", event.currentTarget);
            }
          }}
          onMouseLeave={onHideTooltip}
          onFocus={(event) => {
            if (!isSidebarOpen) {
              onShowTooltip("사이드바 펼치기", event.currentTarget);
            }
          }}
          onBlur={onHideTooltip}
          className={`group relative inline-flex h-9 w-9 items-center justify-center text-slate-700 transition ${
            isSidebarOpen ? "" : "translate-x-px rounded-md hover:bg-white"
          }`}
        >
          {isSidebarOpen ? (
            <GiBatBlade className="h-5 w-5" aria-hidden="true" />
          ) : (
            <>
              <GiBatBlade
                className="h-5 w-5 transition-opacity duration-150 group-hover:opacity-0"
                aria-hidden="true"
              />
              <FiChevronRight
                className="absolute h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              />
            </>
          )}
        </button>
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="사이드바 접기"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          >
            <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-slate-200/55 via-slate-200 to-slate-200/55" />
      </div>

      <div className={`flex-1 overflow-y-auto p-3 ${isSidebarOpen ? "" : "overflow-visible"}`}>
        <div className={isSidebarOpen ? "space-y-2" : "space-y-3"}>
          <div className="group relative">
            <button
              type="button"
              onClick={() => void onCreateSession()}
              disabled={isLoading || isSessionLoading || isSessionListLoading}
              aria-label="새 대화 시작"
              onMouseEnter={(event) => {
                if (!isSidebarOpen) {
                  onShowTooltip("새 대화 시작", event.currentTarget);
                }
              }}
              onMouseLeave={onHideTooltip}
              onFocus={(event) => {
                if (!isSidebarOpen) {
                  onShowTooltip("새 대화 시작", event.currentTarget);
                }
              }}
              onBlur={onHideTooltip}
              className={`flex w-full items-center gap-3 text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
                isSidebarOpen
                  ? "rounded-md px-3 py-2 text-sm font-medium"
                  : "translate-x-px justify-center rounded-md px-0 py-2.5"
              }`}
            >
              <FiEdit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {isSidebarOpen ? <span>새 대화 시작</span> : null}
            </button>
          </div>

          <div
            className={`h-px bg-gradient-to-r from-slate-200/55 via-slate-200 to-slate-200/55 ${
              isSidebarOpen ? "" : "mx-1"
            }`}
          />

          {isSidebarOpen ? (
            sessions.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                저장된 대화가 없습니다.
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === currentSessionId;

                return (
                  <div
                    key={session.id}
                    className={`flex w-full items-start gap-2 rounded-md border p-2 transition ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void onLoadSession(session.id)}
                      disabled={isSessionLoading}
                      className="min-w-0 flex-1 px-2 py-1 text-left disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 text-sm font-semibold">
                          <div className="truncate">{session.title}</div>
                        </div>
                        <div
                          className={`shrink-0 text-[11px] ${
                            isActive ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {formatSessionTime(session.updated_at)}
                        </div>
                      </div>

                      <div
                        className={`mt-2 line-clamp-2 text-xs leading-5 ${
                          isActive ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {session.preview || "아직 메시지가 없습니다."}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteSession(session.id)}
                      disabled={isSessionLoading}
                      aria-label={`${session.title} 삭제`}
                      title="대화 삭제"
                      className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "text-slate-300 hover:bg-white/10 hover:text-white"
                          : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
