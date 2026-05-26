import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-dent-blue-500/50 focus:border-dent-blue-500 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${
            error ? "border-rose-500 focus:ring-rose-500/50 focus:border-rose-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
