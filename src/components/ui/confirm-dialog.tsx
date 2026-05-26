"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { AlertTriangle, LogOut, Check, ArrowRight, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  requireChecklist?: boolean;
  checklistItems?: string[];
  useSlideToConfirm?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireChecklist = false,
  checklistItems = [],
  useSlideToConfirm = false,
  icon,
}: ConfirmDialogProps) {
  const [checklist, setChecklist] = useState<boolean[]>([]);
  const [isSlideCompleted, setIsSlideCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track drag state
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(180);

  const x = useMotionValue(0);
  
  // Calculate dynamic opacity and fill widths
  const fillWidth = useTransform(x, [0, maxDrag], ["0%", "100%"]);
  const textOpacity = useTransform(x, [0, maxDrag / 2], [1, 0]);
  const handleColor = useTransform(
    x,
    [0, maxDrag],
    type === "danger" 
      ? ["rgb(244, 63, 94)", "rgb(225, 29, 72)"] 
      : ["rgb(59, 130, 246)", "rgb(37, 99, 235)"]
  );

  // Initialize checklist state
  useEffect(() => {
    if (isOpen) {
      setChecklist(new Array(checklistItems.length).fill(false));
      setIsSlideCompleted(false);
      x.set(0);
    }
  }, [isOpen, checklistItems.length, x]);

  // Handle resizing/layout calculation for slide track
  useEffect(() => {
    if (isOpen && sliderRef.current && handleRef.current) {
      const sliderWidth = sliderRef.current.clientWidth;
      const handleWidth = handleRef.current.clientWidth;
      // Leave a tiny margin
      setMaxDrag(sliderWidth - handleWidth - 8);
    }
  }, [isOpen]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const allChecked = !requireChecklist || checklist.every(Boolean);

  const handleToggleCheck = (index: number) => {
    const nextList = [...checklist];
    nextList[index] = !nextList[index];
    setChecklist(nextList);
  };

  // Drag handlers
  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    
    // If dragged past 92% of the slider, trigger success
    if (currentX >= maxDrag * 0.9) {
      x.set(maxDrag);
      setIsSlideCompleted(true);
      
      // Bouncy trigger timeout
      setTimeout(() => {
        onConfirm();
      }, 350);
    } else {
      // Spring back to 0
      x.set(0);
    }
  };

  const getThemeColors = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40",
          iconColor: "text-rose-500",
          accentColor: "rose",
          gradientFill: "from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-700",
          glowShadow: "shadow-rose-500/25",
          pingBorder: "border-rose-500/20",
          checkedBgBorder: "bg-rose-500 border-rose-500 shadow-rose-500/20",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40",
          iconColor: "text-amber-500",
          accentColor: "amber",
          gradientFill: "from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700",
          glowShadow: "shadow-amber-500/25",
          pingBorder: "border-amber-500/20",
          checkedBgBorder: "bg-amber-500 border-amber-500 shadow-amber-500/20",
        };
      case "info":
      default:
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40",
          iconColor: "text-blue-500",
          accentColor: "blue",
          gradientFill: "from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700",
          glowShadow: "shadow-blue-500/25",
          pingBorder: "border-blue-500/20",
          checkedBgBorder: "bg-blue-500 border-blue-500 shadow-blue-500/20",
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Dialog Card Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 shadow-3xl p-6 md:p-7 z-10 backdrop-blur-xl"
          >
            {/* Upper Corner close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Container */}
            <div className="flex flex-col items-center text-center gap-5">
              
              {/* Header Icon with pulse ring */}
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl ${themeColors.iconBg} border flex items-center justify-center relative shrink-0 overflow-visible`}>
                  {icon ? (
                    <div className={themeColors.iconColor}>{icon}</div>
                  ) : type === "danger" ? (
                    <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
                  ) : (
                    <LogOut className="w-8 h-8 text-blue-500 shrink-0" />
                  )}
                  {/* Glowing active ring */}
                  <div className={`absolute inset-0 rounded-2xl border-2 ${themeColors.pingBorder} animate-ping opacity-40`} />
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed px-2">
                  {description}
                </p>
              </div>

              {/* Consequence Checklist if required */}
              {requireChecklist && checklistItems.length > 0 && (
                <div className="w-full text-left bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 space-y-3.5">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Acknowledge Risks
                  </p>
                  <div className="space-y-3">
                    {checklistItems.map((item, idx) => (
                      <label 
                        key={idx} 
                        className="flex items-start gap-3 cursor-pointer group text-xs text-slate-655 dark:text-slate-300 font-medium select-none"
                      >
                        <div className="relative flex items-center mt-0.5 shrink-0">
                          <input 
                            type="checkbox"
                            checked={checklist[idx] || false}
                            onChange={() => handleToggleCheck(idx)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            checklist[idx]
                              ? `${themeColors.checkedBgBorder} shadow-sm`
                              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-600"
                          }`}>
                            {checklist[idx] && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                          </div>
                        </div>
                        <span className="leading-snug transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Box: Slider vs Standard Buttons */}
              <div className="w-full mt-2">
                {useSlideToConfirm ? (
                  <div className="space-y-3">
                    <div 
                      ref={sliderRef}
                      className={`w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 p-1 relative flex items-center overflow-hidden transition-all duration-300 ${
                        !allChecked 
                          ? "opacity-50 pointer-events-none grayscale" 
                          : "hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {/* Active Fill Track */}
                      <motion.div 
                        style={{ width: fillWidth }}
                        className={`absolute left-1 top-1 bottom-1 rounded-xl bg-gradient-to-r ${themeColors.gradientFill} opacity-20`}
                      />

                      {/* Sliding Handle */}
                      <motion.div
                        ref={handleRef}
                        drag={allChecked && !isSlideCompleted ? "x" : false}
                        dragConstraints={{ left: 0, right: maxDrag }}
                        dragElastic={0.08}
                        dragMomentum={false}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        style={{ x }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing text-white shadow-lg ${themeColors.glowShadow} z-10 transition-colors`}
                        animate={{
                          backgroundColor: isSlideCompleted 
                            ? "rgb(16, 185, 129)" // emerald success
                            : type === "danger" 
                              ? "rgb(244, 63, 94)" // rose
                              : "rgb(59, 130, 246)" // blue
                        }}
                      >
                        {isSlideCompleted ? (
                          <Check className="w-5.5 h-5.5 stroke-[2.5px] animate-scale-pop" />
                        ) : (
                          <motion.div
                            animate={isDragging ? { scale: 1.15 } : { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 1.8 } }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Text Overlay */}
                      <motion.div 
                        style={{ opacity: textOpacity }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[13px] font-bold text-slate-500 dark:text-slate-400"
                      >
                        <span className="animate-shimmer bg-gradient-to-r from-slate-500 via-slate-750 to-slate-500 dark:from-slate-400 dark:via-slate-200 dark:to-slate-400 bg-[length:200%_auto] bg-clip-text text-transparent">
                          {isSlideCompleted ? "Success!" : `Slide to ${confirmText}`}
                        </span>
                      </motion.div>
                    </div>

                    {/* Standard Cancel Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      disabled={isSlideCompleted}
                      className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 py-2.5 rounded-xl font-medium"
                    >
                      {cancelText}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3 w-full">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {cancelText}
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={allChecked ? { scale: 1.02 } : {}} whileTap={allChecked ? { scale: 0.98 } : {}}>
                      <Button
                        variant={type === "danger" ? "destructive" : "primary"}
                        size="sm"
                        onClick={onConfirm}
                        disabled={!allChecked}
                        className={`w-full py-2.5 rounded-xl shadow-md font-bold transition-all ${
                          type === "danger" 
                            ? "shadow-rose-500/10 hover:shadow-rose-500/20" 
                            : "shadow-blue-500/10 hover:shadow-blue-500/20"
                        }`}
                      >
                        {confirmText}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
