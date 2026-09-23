"use client";

import { useState } from "react";

export function Composer({
  disabled,
  placeholder,
  onSend,
}: {
  disabled?: boolean;
  placeholder?: string;
  onSend: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const next = value.trim();
    if (!next || disabled) return;
    onSend(next);
    setValue("");
  }

  return (
    <div className="composer-wrap border-t border-white/10 px-3 py-2">
      <div className="flex items-end gap-2 rounded-[20px] bg-[var(--fill)] px-3 py-2">
        <textarea
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder ?? "Describe a change…"}
          className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent text-[16px] text-[var(--label)] outline-none placeholder:text-[var(--tertiary)]"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          className="send-btn"
          disabled={disabled || !value.trim()}
          onClick={submit}
          aria-label="Send"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5 5.5 11h4v8.5h5V11h4L12 4.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
