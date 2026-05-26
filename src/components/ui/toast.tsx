"use client";

import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 md:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100";
          let Icon = Info;
          let iconColor = "text-dent-blue-500";

          if (toast.variant === "success") {
            bgColor = "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-50";
            Icon = CheckCircle;
            iconColor = "text-emerald-500";
          } else if (toast.variant === "destructive") {
            bgColor = "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-900/40 text-rose-900 dark:text-rose-50";
            Icon = AlertTriangle;
            iconColor = "text-rose-500";
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${bgColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-grow">
                <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="mt-1 text-xs opacity-80 leading-normal">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
