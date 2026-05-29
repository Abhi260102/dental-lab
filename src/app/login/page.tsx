"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const features = [
  { icon: ShieldCheck, text: "Military-grade encryption on every card" },
  { icon: CheckCircle, text: "Instant QR verification for patients" },
  { icon: Sparkles, text: "AI-powered 3D card previews" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [labName, setLabName] = useState("DentShield");

  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

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

  const validateEmail = (val: string) => {
    if (!val) { setEmailError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError("Please enter a valid email address"); return false;
    }
    setEmailError(""); return true;
  };

  const validatePassword = (val: string) => {
    if (!val) { setPasswordError("Password is required"); return false; }
    if (val.length < 6) { setPasswordError("At least 6 characters required"); return false; }
    setPasswordError(""); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true); setPasswordTouched(true);
    const emailOk = validateEmail(email);
    const passOk = validatePassword(password);
    if (!emailOk || !passOk) {
      toast({ title: "Validation Error", description: "Please fix the highlighted fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email: email.toLowerCase(), password });
      if (res?.error) {
        toast({ title: "Sign In Failed", description: "Incorrect email or password.", variant: "destructive" });
      } else {
        toast({ title: "Welcome back! 🎉", description: "Redirecting to your dashboard…", variant: "success" });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      {/* ══════════════════════════════════════════
          LEFT PANEL — Background Image + Branding
         ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />

        {/* Dark overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">

          {/* Top: Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-dent-blue-500 to-emerald-400 rounded-xl blur opacity-50" />
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-slate-900">
                <img src={logoUrl} alt={labName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white select-none">
              {labName}
            </span>
          </motion.div>

          {/* Center: Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                Dental Warranty System
              </span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Precision Dental<br />
              <span className="bg-gradient-to-r from-blue-300 to-emerald-400 bg-clip-text text-transparent">
                Warranty Cards
              </span>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Issue, manage, and verify premium dental warranty certificates. Trusted by leading laboratories across the country.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-3 mt-2">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
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

          {/* Bottom: Testimonial / tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[12px] text-slate-400 italic leading-relaxed max-w-xs">
              "The most professional warranty management system we've used. Our patients love the digital certificates."
            </p>
            <span className="text-[11px] text-slate-500 font-semibold tracking-wide">— Dr. Aarav Mehta, Apex Dental Studio</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Form (full light + dark support)
         ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto
                      bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

        {/* Ambient glows — theme-aware opacity */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full
                          bg-dent-blue-500/8 dark:bg-dent-blue-500/12 blur-[90px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full
                          bg-emerald-500/6 dark:bg-emerald-400/8 blur-[80px]" />
        </div>

        {/* Mobile background image overlay */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center
                     opacity-[0.06] dark:opacity-[0.12] transition-opacity duration-500"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />

        {/* Theme Toggle */}
        <div className="absolute top-5 right-5 z-30">
          <ThemeToggle />
        </div>

        {/* ── Form wrapper ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[420px] mx-auto px-4 sm:px-0 py-10"
        >
          {/* Mobile only: Logo header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-7"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-dent-blue-500 to-emerald-400 rounded-xl blur opacity-40" />
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/15 shadow-lg bg-slate-900">
                <img src={logoUrl} alt={labName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-dent-blue-600 to-emerald-500 dark:from-dent-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {labName}
            </span>
          </motion.div>

          {/* ── Card shell ─────────────────────────────────────
               Light: pure white, slate-200 border, crisp shadow
               Dark:  semi-transparent slate-900, subtle border
          ─────────────────────────────────────────────────── */}
          <div className="
            rounded-2xl p-7 sm:p-9
            bg-white dark:bg-slate-900/75
            border border-slate-200 dark:border-white/[0.07]
            shadow-xl shadow-slate-300/40 dark:shadow-black/50
            backdrop-blur-xl
            transition-all duration-500
          ">

            {/* Form Header */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-1.5 mb-7"
            >
              <motion.h1
                variants={childVariants}
                className="text-2xl font-extrabold tracking-tight
                           text-slate-900 dark:text-white"
              >
                Welcome back 👋
              </motion.h1>
              <motion.p
                variants={childVariants}
                className="text-[13px] font-medium
                           text-slate-600 dark:text-slate-400"
              >
                Sign in to access your warranty dashboard
              </motion.p>
            </motion.div>

            {/* Form fields */}
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <motion.div variants={childVariants}>
                <Input
                  label="Email Address"
                  type="email"
                  id="login-email"
                  placeholder="you@yourlab.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailTouched) validateEmail(e.target.value); }}
                  onBlur={() => { setEmailTouched(true); validateEmail(email); }}
                  error={emailError}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </motion.div>

              <motion.div variants={childVariants}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordTouched) validatePassword(e.target.value); }}
                  onBlur={() => { setPasswordTouched(true); validatePassword(password); }}
                  error={passwordError}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="text-slate-400 hover:text-dent-blue-600 dark:hover:text-dent-blue-400 transition-colors focus:outline-none cursor-pointer"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={showPassword ? "hide" : "show"}
                          initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
                          transition={{ duration: 0.18 }}
                          className="flex"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  }
                />
              </motion.div>

              <motion.div variants={childVariants} className="pt-1">
                <Button
                  type="submit"
                  id="login-submit"
                  isLoading={isLoading}
                  className="w-full h-12 font-bold tracking-wide text-[13px]
                    bg-gradient-to-r from-dent-blue-600 to-dent-blue-500
                    hover:from-dent-blue-700 hover:to-dent-blue-600
                    text-white
                    shadow-lg shadow-dent-blue-500/30 hover:shadow-dent-blue-500/45
                    active:scale-[0.99] transition-all duration-200
                    flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                >
                  {!isLoading && (
                    <>
                      <ShieldCheck className="w-4 h-4 opacity-90" />
                      Sign In to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider + register link */}
            {/* <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.4 }}
              className="text-center text-[12.5px] font-medium mt-6 pt-5
                         text-slate-500 dark:text-slate-400
                         border-t border-slate-200 dark:border-white/[0.07]"
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold
                           text-dent-blue-600 dark:text-dent-blue-400
                           hover:text-emerald-600 dark:hover:text-emerald-400
                           transition-colors underline underline-offset-2"
              >
                Register your lab
              </Link>
            </motion.p> */}

          </div>{/* end .card-shell */}

          {/* Branding footnote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
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
