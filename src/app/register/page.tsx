"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff,
  CheckCircle2, Circle, Sparkles, UserPlus,
  Shield, FileCheck, QrCode,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

// ── Framer Motion variants ───────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ── Password strength criteria ───────────────────────────────
const passwordCriteria = [
  { id: "min6",  label: "At least 6 characters",       test: (v: string) => v.length >= 6 },
  { id: "upper", label: "Contains an uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "num",   label: "Contains a number or symbol",  test: (v: string) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
];

// ── Left-panel highlights ────────────────────────────────────
const highlights = [
  { icon: Shield,    text: "Create unlimited warranty cards" },
  { icon: FileCheck, text: "Professional printable certificates" },
  { icon: QrCode,    text: "QR-secured patient verification" },
];

// ── Stats ────────────────────────────────────────────────────
const stats = [["500+", "Laboratories"], ["50K+", "Cards Issued"], ["99.9%", "Uptime"]];

export default function RegisterPage() {
  const [name,             setName]             = useState("");
  const [nameError,        setNameError]        = useState("");
  const [nameTouched,      setNameTouched]      = useState(false);

  const [email,            setEmail]            = useState("");
  const [emailError,       setEmailError]       = useState("");
  const [emailTouched,     setEmailTouched]     = useState(false);

  const [password,         setPassword]         = useState("");
  const [passwordError,    setPasswordError]    = useState("");
  const [passwordTouched,  setPasswordTouched]  = useState(false);
  const [showPassword,     setShowPassword]     = useState(false);

  const [confirmPassword,        setConfirmPassword]        = useState("");
  const [confirmPasswordError,   setConfirmPasswordError]   = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showConfirmPassword,    setShowConfirmPassword]    = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl,   setLogoUrl]   = useState("/logo.png");
  const [labName,   setLabName]   = useState("DentShield");

  const router = useRouter();
  const { status } = useSession();
  const { toast }  = useToast();

  // Password strength
  const criteriaPassed = useMemo(() => passwordCriteria.map((c) => c.test(password)), [password]);
  const passedCount    = criteriaPassed.filter(Boolean).length;
  const strengthPct    = (passedCount / passwordCriteria.length) * 100;
  const strengthColor  = passedCount === 0 ? "bg-slate-300 dark:bg-slate-700"
    : passedCount === 1 ? "bg-rose-500"
    : passedCount === 2 ? "bg-amber-400"
    : "bg-emerald-500";
  const strengthLabel  = ["", "Weak", "Fair", "Strong"][passedCount];
  const strengthTextColor = passedCount === 1 ? "text-rose-500" : passedCount === 2 ? "text-amber-500" : "text-emerald-500";

  useEffect(() => {
    fetch("/api/auth/logo")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.labLogo) setLogoUrl(d.labLogo);
          if (d.labName) setLabName(d.labName);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // ── Validators ───────────────────────────────────────────
  const validateName = (v: string) => {
    if (!v.trim())        { setNameError("Full Name / Lab Name is required"); return false; }
    if (v.trim().length < 2) { setNameError("Name must be at least 2 characters"); return false; }
    setNameError(""); return true;
  };
  const validateEmail = (v: string) => {
    if (!v) { setEmailError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailError("Enter a valid email address"); return false; }
    setEmailError(""); return true;
  };
  const validatePassword = (v: string) => {
    if (!v) { setPasswordError("Password is required"); return false; }
    if (v.length < 6) { setPasswordError("At least 6 characters required"); return false; }
    setPasswordError(""); return true;
  };
  const validateConfirm = (v: string) => {
    if (!v) { setConfirmPasswordError("Please confirm your password"); return false; }
    if (v !== password) { setConfirmPasswordError("Passwords do not match"); return false; }
    setConfirmPasswordError(""); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true); setEmailTouched(true); setPasswordTouched(true); setConfirmPasswordTouched(true);
    const ok = [validateName(name), validateEmail(email), validatePassword(password), validateConfirm(confirmPassword)].every(Boolean);
    if (!ok) {
      toast({ title: "Validation Error", description: "Please fix the highlighted fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast({ title: "Account Registered 🎉", description: "Your lab credentials are set. Please sign in.", variant: "success" });
      router.push("/login");
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reusable animated eye toggle ────────────────────────
  const EyeToggle = ({ show, onToggle, label }: { show: boolean; onToggle: () => void; label: string }) => (
    <button type="button" onClick={onToggle} tabIndex={-1} aria-label={label}
      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={show ? "hide" : "show"}
          initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
          transition={{ duration: 0.18 }} className="flex">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );

  return (
    /* Root: theme-aware — never hardcode bg-slate-950 here */
    <div className="min-h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      {/* ══════════════════════════════════════════
          LEFT PANEL — always dark (bg image)
         ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative flex-col justify-between overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[20s] hover:scale-100"
          style={{ backgroundImage: "url('/register-bg.png')" }}
        />
        {/* Dark overlays — always dark regardless of theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        {/* Thin right-edge separator */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Panel content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">

          {/* Logo + brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-dent-blue-500 rounded-xl blur opacity-50" />
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-slate-900">
                <img src={logoUrl} alt={labName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white select-none">{labName}</span>
          </motion.div>

          {/* Main pitch */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            {/* Badge — text-white always visible on dark image */}
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                Get Started Free
              </span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Join the Future<br />
              {/* from-emerald-400 and to-blue-300 are valid Tailwind colors */}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-300 bg-clip-text text-transparent">
                of Dental Labs
              </span>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Set up your laboratory workspace in under 2 minutes. Start issuing professional warranty cards immediately after registration.
            </p>

            {/* Highlights */}
            <div className="flex flex-col gap-3 mt-2">
              {highlights.map(({ icon: Icon, text }, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.12, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[13px] text-slate-300 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex gap-8"
          >
            {stats.map(([stat, label]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-extrabold text-white">{stat}</span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Form (full light + dark)
         ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto
                      bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

        {/* Ambient glows — theme-aware opacity */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full
                          bg-emerald-500/8 dark:bg-emerald-400/12 blur-[90px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full
                          bg-dent-blue-500/6 dark:bg-dent-blue-500/10 blur-[80px]" />
        </div>

        {/* Mobile background image overlay */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center
                     opacity-[0.06] dark:opacity-[0.12] transition-opacity duration-500"
          style={{ backgroundImage: "url('/register-bg.png')" }}
        />

        {/* Theme Toggle */}
        <div className="absolute top-5 right-5 z-30">
          <ThemeToggle />
        </div>

        {/* ── Form wrapper ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[420px] mx-auto px-4 sm:px-0 py-8"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-7"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-dent-blue-500 rounded-xl blur opacity-40" />
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/15 shadow-lg bg-slate-900">
                <img src={logoUrl} alt={labName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-dent-blue-600 dark:from-emerald-400 dark:to-dent-blue-400 bg-clip-text text-transparent">
              {labName}
            </span>
          </motion.div>

          {/* ── Card shell ─────────────────────────────────────
               Light: pure white bg, slate-200 border
               Dark:  semi-transparent slate-900, subtle border
          ─────────────────────────────────────────────────── */}
          <div className="
            rounded-2xl p-6 sm:p-8
            bg-white dark:bg-slate-900/75
            border border-slate-200 dark:border-white/[0.07]
            shadow-xl shadow-slate-300/40 dark:shadow-black/50
            backdrop-blur-xl
            transition-all duration-500
          ">
            {/* Form header */}
            <motion.div
              variants={containerVariants} initial="hidden" animate="visible"
              className="flex flex-col gap-1.5 mb-5"
            >
              <motion.h1 variants={childVariants}
                className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create your workspace ✨
              </motion.h1>
              <motion.p variants={childVariants}
                className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
                Register your lab — first account becomes Admin
              </motion.p>
            </motion.div>

            {/* Admin note */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-start gap-2 mb-5 p-2.5 rounded-xl
                         bg-emerald-50 dark:bg-emerald-400/10
                         border border-emerald-200 dark:border-emerald-400/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 leading-relaxed">
                First registered account is automatically granted Administrator access.
              </p>
            </motion.div>

            {/* Form fields */}
            <motion.form
              variants={containerVariants} initial="hidden" animate="visible"
              onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate
            >
              {/* Full Name */}
              <motion.div variants={childVariants}>
                <Input
                  label="Full Name / Lab Name" type="text" id="register-name"
                  placeholder="e.g. Apex Dental Artistry"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (nameTouched) validateName(e.target.value); }}
                  onBlur={() => { setNameTouched(true); validateName(name); }}
                  error={nameError} leftIcon={<User className="w-4 h-4" />}
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={childVariants}>
                <Input
                  label="Email Address" type="email" id="register-email"
                  placeholder="admin@yourlab.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailTouched) validateEmail(e.target.value); }}
                  onBlur={() => { setEmailTouched(true); validateEmail(email); }}
                  error={emailError} leftIcon={<Mail className="w-4 h-4" />}
                />
              </motion.div>

              {/* Password + Strength panel */}
              <motion.div variants={childVariants}>
                <Input
                  label="Password" type={showPassword ? "text" : "password"} id="register-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordTouched) validatePassword(e.target.value);
                    if (confirmPasswordTouched) validateConfirm(confirmPassword);
                  }}
                  onBlur={() => { setPasswordTouched(true); validatePassword(password); }}
                  error={passwordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} label={showPassword ? "Hide password" : "Show password"} />}
                />

                {/* Animated strength panel */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div key="strength"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-col gap-2 px-0.5">
                        {/* Strength bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${strengthColor} transition-colors duration-400`}
                              animate={{ width: `${strengthPct}%` }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </div>
                          {strengthLabel && (
                            <span className={`text-[10px] font-bold w-10 text-right ${strengthTextColor}`}>
                              {strengthLabel}
                            </span>
                          )}
                        </div>
                        {/* Criteria checklist */}
                        <ul className="flex flex-col gap-1">
                          {passwordCriteria.map((c, i) => (
                            <motion.li key={c.id}
                              initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.2 }}
                              className="flex items-center gap-1.5"
                            >
                              <motion.span
                                animate={{ scale: criteriaPassed[i] ? [1.3, 1] : 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {criteriaPassed[i]
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                  : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}
                              </motion.span>
                              <span className={`text-[11px] font-medium transition-colors duration-200 ${
                                criteriaPassed[i]
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-slate-500 dark:text-slate-500"
                              }`}>
                                {c.label}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={childVariants}>
                <Input
                  label="Confirm Password" type={showConfirmPassword ? "text" : "password"} id="register-confirm"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (confirmPasswordTouched) validateConfirm(e.target.value); }}
                  onBlur={() => { setConfirmPasswordTouched(true); validateConfirm(confirmPassword); }}
                  error={confirmPasswordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={<EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} label={showConfirmPassword ? "Hide confirm" : "Show confirm"} />}
                />
              </motion.div>

              {/* Submit button */}
              <motion.div variants={childVariants} className="pt-1">
                <Button
                  type="submit" id="register-submit" isLoading={isLoading}
                  className="w-full h-12 font-bold tracking-wide text-[13px] text-white
                    bg-gradient-to-r from-emerald-600 to-dent-blue-500
                    hover:from-emerald-700 hover:to-dent-blue-600
                    shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30
                    active:scale-[0.99] transition-all duration-200
                    flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                >
                  {!isLoading && (
                    <>
                      <UserPlus className="w-4 h-4 opacity-90" />
                      Register Lab Credentials
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Footer / sign-in link */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="text-center text-[12.5px] font-medium mt-5 pt-5
                         text-slate-500 dark:text-slate-400
                         border-t border-slate-200 dark:border-white/[0.07]"
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold
                           text-emerald-600 dark:text-emerald-400
                           hover:text-dent-blue-600 dark:hover:text-dent-blue-400
                           transition-colors underline underline-offset-2"
              >
                Sign in here
              </Link>
            </motion.p>
          </div>{/* end card shell */}

          {/* Branding footnote */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-center text-[11px] mt-5 select-none tracking-wide
                       text-slate-400 dark:text-slate-600"
          >
            Dental Lab Warranty Management System
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
