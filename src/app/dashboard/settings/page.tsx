"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import { 
  Building2, 
  Upload, 
  Trash2, 
  Lock, 
  Save, 
  Settings, 
  UserCircle2, 
  Check 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { profile, refreshProfile } = useProfile();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [labName, setLabName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [labLogo, setLabLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [labPhone, setLabPhone] = useState("");
  const [labEmail, setLabEmail] = useState("");
  const [labWebsite, setLabWebsite] = useState("");
  const [labAddress, setLabAddress] = useState("");
  const [cardBgImage, setCardBgImage] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (profile && !isInitialized) {
      setName(profile.name || "");
      setLabName(profile.labName || "");
      setLabLogo(profile.labLogo || "");
      setSignature(profile.signature || "");
      setLabPhone(profile.labPhone || "+91 12345 67890");
      setLabEmail(profile.labEmail || "info@yourlab.com");
      setLabWebsite(profile.labWebsite || "www.yourlab.com");
      setLabAddress(profile.labAddress || "");
      setCardBgImage(profile.cardBgImage || "");
      setTermsAndConditions(profile.termsAndConditions || "");
      setIsInitialized(true);
    } else if (session?.user && !isInitialized && !profile) {
      setName(session.user.name || "");
      setLabName(session.user.labName || "");
    }
  }, [profile, session, isInitialized]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "signature" | "bg"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check (e.g. 500KB to prevent heavy base64 strings in MongoDB)
    if (file.size > 512000) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 500KB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "logo") {
        setLabLogo(base64String);
      } else if (type === "signature") {
        setSignature(base64String);
      } else {
        setCardBgImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          labName,
          labLogo,
          signature,
          labPhone,
          labEmail,
          labWebsite,
          labAddress,
          cardBgImage,
          termsAndConditions,
          password: password || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save settings");
      }

      // Synchronize session details in NextAuth cache
      await update({
        name: json.user.name,
        labName: json.user.labName,
      });

      // Refresh custom branding context to update logo/signature reactively
      await refreshProfile();

      toast({
        title: "Settings Saved",
        description: "Your workspace profile details have been successfully updated.",
        variant: "success",
      });

      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-450 uppercase tracking-widest font-bold">Preferences</p>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Branding & Account Settings
        </h2>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Branding assets */}
        <div className="md:col-span-1 space-y-6">
          {/* Logo Upload Card */}
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 py-4 border-b border-slate-200/40">
              <CardTitle className="text-sm">Lab Logo Branding</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <div className="w-24 h-24 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-inner relative group">
                {labLogo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={labLogo} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setLabLogo("")}
                      className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              
              <label className="w-full">
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          {/* Signature Upload Card */}
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 py-4 border-b border-slate-200/40">
              <CardTitle className="text-sm">Authorized Signature</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <div className="w-full h-20 rounded-xl border border-dashed border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative group">
                {signature ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={signature} alt="Signature" className="max-h-full max-w-full p-2 object-contain" />
                    <button
                      type="button"
                      onClick={() => setSignature("")}
                      className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">No Signature Set</span>
                )}
              </div>
              
              <label className="w-full">
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Signature
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "signature")}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          {/* Card Background Image Upload Card */}
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 py-4 border-b border-slate-200/40">
              <CardTitle className="text-sm">Card Background Backdrop</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <div className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative group">
                {cardBgImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cardBgImage} alt="Card Background" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCardBgImage("")}
                      className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Default Premium Gradient</span>
                )}
              </div>
              
              <label className="w-full">
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Background
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "bg")}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Account details form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200/40">
              <CardTitle className="text-sm">Account Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              
              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-2 mb-2">
                  <UserCircle2 className="w-4.5 h-4.5 text-dent-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">User Profile</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Operator Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Laboratory Branding Name"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Lab Phone Number"
                    value={labPhone}
                    onChange={(e) => setLabPhone(e.target.value)}
                    required
                  />
                  <Input
                    label="Lab Email Address"
                    value={labEmail}
                    type="email"
                    onChange={(e) => setLabEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Lab Website"
                    value={labWebsite}
                    onChange={(e) => setLabWebsite(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Lab Physical Address</label>
                    <textarea
                      rows={4}
                      value={labAddress}
                      onChange={(e) => setLabAddress(e.target.value)}
                      placeholder="Enter physical address..."
                      className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dent-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Default Warranty Terms & Conditions</label>
                    <textarea
                      rows={4}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      placeholder="Enter warranty terms and conditions (one per line)..."
                      className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dent-blue-500 text-slate-800 dark:text-slate-100"
                    />
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-none">
                      These terms will be displayed on the public card verification page. Use newlines to separate terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Details */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-2 mb-2">
                  <Lock className="w-4.5 h-4.5 text-dent-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password Update (Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSaving}
                  className="gap-2 px-6"
                >
                  <Save className="w-4 h-4" />
                  Save Workspace Changes
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </form>

    </div>
  );
}
