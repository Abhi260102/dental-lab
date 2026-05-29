import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      hint,
      type = "text",
      id,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            /* Light: slate-600 (readable on white). Dark: slate-400 (readable on dark) */
            className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 pl-0.5 transition-colors duration-200"
          >
            {label}
          </label>
        )}

        <div className="relative w-full flex items-center group">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={`absolute left-3.5 pointer-events-none flex items-center justify-center transition-colors duration-200 ${
                hasError
                  ? "text-rose-500 dark:text-rose-400"
                  : "text-slate-400 dark:text-slate-500 group-focus-within:text-dent-blue-600 dark:group-focus-within:text-dent-blue-400"
              }`}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            className={`
              w-full py-3 rounded-xl border text-sm transition-all duration-200
              focus:outline-none
              disabled:opacity-50 disabled:pointer-events-none
              ${leftIcon ? "pl-10" : "pl-4"}
              ${rightIcon ? "pr-10" : "pr-4"}
              ${
                hasError
                  ? "border-rose-400 dark:border-rose-500/70 bg-rose-50 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 placeholder-rose-300 dark:placeholder-rose-800 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400"
                  : "bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-dent-blue-500/25 focus:border-dent-blue-500 dark:focus:border-dent-blue-400 dark:focus:ring-dent-blue-400/20"
              }
              ${className}
            `}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message — slides down smoothly */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            hasError ? "max-h-8 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {hasError && (
            <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold pl-0.5 pt-0.5">
              <svg
                className="w-3 h-3 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.65" fill="currentColor" />
              </svg>
              {error}
            </span>
          )}
        </div>

        {/* Hint text */}
        {hint && !hasError && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-0.5">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
