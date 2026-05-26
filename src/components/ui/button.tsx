import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dent-blue-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    
    let variantStyles = "";
    if (variant === "primary") {
      variantStyles = "bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 text-white shadow-md hover:from-dent-blue-700 hover:to-dent-blue-600";
    } else if (variant === "secondary") {
      variantStyles = "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100";
    } else if (variant === "outline") {
      variantStyles = "border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300";
    } else if (variant === "ghost") {
      variantStyles = "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400";
    } else if (variant === "destructive") {
      variantStyles = "bg-rose-600 hover:bg-rose-700 text-white shadow-sm";
    } else if (variant === "accent") {
      variantStyles = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm";
    }

    let sizeStyles = "";
    if (size === "sm") {
      sizeStyles = "px-3 py-1.5 text-xs";
    } else if (size === "md") {
      sizeStyles = "px-4 py-2.5 text-sm";
    } else if (size === "lg") {
      sizeStyles = "px-6 py-3.5 text-base";
    } else if (size === "icon") {
      sizeStyles = "p-2";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
