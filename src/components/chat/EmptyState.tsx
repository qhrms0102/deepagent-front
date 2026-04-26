// Empty conversation state with starter prompt shortcuts.
import type React from "react";

interface EmptyStateProps {
  prompts: string[];
  disabled: boolean;
  onSelectPrompt: (event: React.SyntheticEvent, prompt: string) => void | Promise<void>;
}

export function EmptyState({ prompts, disabled, onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex min-h-full items-center justify-center py-8">
      <div className="max-w-2xl rounded-[1.5rem] border border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          Quick Start
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
          새 대화를 시작했습니다.
          <br />
          질문을 보내면 기록이 저장됩니다.
        </div>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          좌측 대화 이력에서 예전 대화를 다시 열 수 있습니다. 현재 빈 상태에서는 아래
          예시 중 하나로 바로 시작할 수 있습니다.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              onClick={(event) => void onSelectPrompt(event, prompt)}
              disabled={disabled}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
