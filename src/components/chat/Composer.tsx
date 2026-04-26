// Chat input composer with submit/pause control.
import type React from "react";
import { FiArrowUp, FiPause } from "react-icons/fi";

interface ComposerProps {
  input: string;
  canSend: boolean;
  isLoading: boolean;
  isSessionLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: React.SyntheticEvent) => void | Promise<void>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onStop: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function Composer({
  input,
  canSend,
  isLoading,
  isSessionLoading,
  onChange,
  onSubmit,
  onKeyDown,
  onStop,
  textareaRef,
}: ComposerProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} className="bg-transparent px-4 pb-4 pt-2 sm:px-6 sm:pb-5">
      <div className="mx-auto w-full max-w-4xl rounded-[1.1rem] border border-slate-200 bg-white px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex min-h-[36px] items-center gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            className="h-[36px] min-h-[36px] flex-1 resize-none border-0 bg-transparent px-3 py-[5px] text-[15px] leading-[26px] outline-none placeholder:text-slate-400"
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading || isSessionLoading}
            placeholder="예: 서울과 뉴욕 날씨를 비교하고 옷차림도 추천해줘"
          />

          {isLoading ? (
            <button
              type="button"
              aria-label="생성 중단"
              onClick={onStop}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-900 transition hover:bg-rose-200"
            >
              <FiPause className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="전송"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canSend}
            >
              <FiArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
