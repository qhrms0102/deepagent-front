import { useMemo, useState } from "react";
import { Composer } from "./components/chat/Composer";
import { EmptyState } from "./components/chat/EmptyState";
import { MessageList } from "./components/chat/MessageList";
import { SessionSidebar } from "./components/sidebar/SessionSidebar";
import { SidebarTooltip } from "./components/sidebar/SidebarTooltip";
import { starterPrompts } from "./constants/chat";
import { useChatRuntime } from "./hooks/useChatRuntime";
import { useSidebarTooltip } from "./hooks/useSidebarTooltip";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    [],
  );
  const {
    messages,
    sessions,
    currentSessionId,
    input,
    isLoading,
    isSessionListLoading,
    isSessionLoading,
    errorBanner,
    textareaRef,
    scrollRef,
    bottomRef,
    reasoningRefs,
    canSend,
    setInput,
    handleScroll,
    handleSubmit,
    handleComposerKeyDown,
    stopStreaming,
    loadSession,
    createNewSession,
    deleteSession,
  } = useChatRuntime(apiBaseUrl);
  const { sidebarTooltip, showSidebarTooltip, hideSidebarTooltip } = useSidebarTooltip();

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900">
      <div className="relative flex h-full w-full overflow-hidden">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="사이드바 닫기"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 z-20 bg-slate-950/20 lg:hidden"
          />
        ) : null}

        <aside
          data-open={isSidebarOpen}
          className={`sidebar-shell absolute inset-y-0 left-0 z-30 flex h-full flex-col border-r border-slate-200 bg-slate-50/95 lg:static lg:z-0 lg:h-full lg:bg-slate-50 ${
            isSidebarOpen
              ? "translate-x-0 overflow-hidden lg:w-[300px]"
              : "-translate-x-full overflow-visible w-[72px] lg:w-[72px] lg:min-w-[72px] lg:translate-x-0"
          }`}
        >
          <div className="sidebar-content flex h-full flex-1 flex-col">
            <SessionSidebar
              currentSessionId={currentSessionId}
              isLoading={isLoading}
              isSessionListLoading={isSessionListLoading}
              isSessionLoading={isSessionLoading}
              isSidebarOpen={isSidebarOpen}
              sessions={sessions}
              onCreateSession={createNewSession}
              onDeleteSession={deleteSession}
              onLoadSession={loadSession}
              onOpenChange={setIsSidebarOpen}
              onShowTooltip={showSidebarTooltip}
              onHideTooltip={hideSidebarTooltip}
            />
          </div>
        </aside>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="relative flex h-16 items-center justify-between gap-3 px-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-slate-950">Deep Agent Chat</div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="rounded-md bg-slate-100 px-3 py-1.5">API {apiBaseUrl}</span>
            </div>
            <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-slate-200/55 via-slate-200 to-slate-200/55 sm:inset-x-6" />
          </div>

          {errorBanner ? (
            <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-900 sm:px-6">
              {errorBanner}
            </div>
          ) : null}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6"
          >
            {isSessionLoading || isSessionListLoading ? (
              <div className="flex min-h-full items-center justify-center py-8">
                <div className="rounded-[1rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm">
                  대화를 불러오는 중입니다.
                </div>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                prompts={starterPrompts}
                disabled={isLoading || isSessionLoading}
                onSelectPrompt={handleSubmit}
              />
            ) : (
              <MessageList messages={messages} reasoningRefs={reasoningRefs} />
            )}
            <div ref={bottomRef} />
          </div>

          <Composer
            input={input}
            canSend={canSend}
            isLoading={isLoading}
            isSessionLoading={isSessionLoading}
            onChange={setInput}
            onSubmit={handleSubmit}
            onKeyDown={handleComposerKeyDown}
            onStop={stopStreaming}
            textareaRef={textareaRef}
          />
        </main>

        <SidebarTooltip tooltip={sidebarTooltip} />
      </div>
    </div>
  );
}

export default App;
