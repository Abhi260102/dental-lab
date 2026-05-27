"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import { useWarrantyStore } from "@/store/use-warranty-store";
import WarrantyForm from "@/components/warranty/warranty-form";
import WarrantyCardPreview from "@/components/warranty/warranty-card-preview";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function CreateCardContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledValues, setPrefilledValues] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { data: session } = useSession();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  // Connect to Zustand store to retrieve draft details in real time
  const draftCard = useWarrantyStore((state) => state.draftCard);
  const resetDraftCard = useWarrantyStore((state) => state.resetDraftCard);

  useEffect(() => {
    if (templateId) {
      fetch(`/api/templates/${templateId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const template = json.data;
            setPrefilledValues({
              doctorName: template.doctorName || "",
              warrantyYears: template.warrantyYears,
              materialType: template.materialType,
              notes: template.notes || "",
              cardBgImage: template.cardBgImage || "",
              layoutFront: template.layoutFront || "default",
              layoutBack: template.layoutBack || "default",
              fontStyle: template.fontStyle || "inter",
              primaryColor: template.primaryColor || "#0f52ba",
            });
            
            toast({
              title: "Template Loaded",
              description: `Applying settings from template "${template.name}".`,
              variant: "success",
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load template:", err);
        });
    }
  }, [templateId, toast]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/warranty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          // Bind custom lab identity presets from active session if needed
          signature: profile?.signature || session?.user?.signature || "",
          labLogo: profile?.labLogo || session?.user?.labLogo || "",
          labPhone: profile?.labPhone || "",
          labEmail: profile?.labEmail || "",
          labWebsite: profile?.labWebsite || "",
          labAddress: profile?.labAddress || "",
          cardBgImage: data.cardBgImage || profile?.cardBgImage || "",
          layoutFront: data.layoutFront || "default",
          layoutBack: data.layoutBack || "default",
          fontStyle: data.fontStyle || "inter",
          primaryColor: data.primaryColor || "#0f52ba",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create card");
      }

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0f52ba", "#10b981", "#ffffff"],
      });

      toast({
        title: "Certificate Generated",
        description: `Warranty card successfully generated for ${data.patientName}.`,
        variant: "success",
      });

      // Clear draft states
      resetDraftCard();
      
      // Redirect
      router.push("/dashboard/cards");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message || "Failed to save warranty card.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Return Hook */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/cards"
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warranty Certificates</span>
          <h2 className="text-lg font-bold text-slate-850 dark:text-white leading-tight">Create Smart Certificate</h2>
        </div>
      </div>

      {/* Split grid display */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Create Form */}
        <div className="xl:col-span-5 order-2 xl:order-1">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                Certificate Parameters
              </CardTitle>
              <CardDescription>
                Fill in the details below to generate a premium verification card.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <WarrantyForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                defaultValues={prefilledValues || undefined}
                initialTemplateId={templateId || ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live preview */}
        <div className="xl:col-span-7 order-1 xl:order-2 flex flex-col items-center gap-4 xl:sticky xl:top-[88px]">
          <div className="text-center">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Live Certificate Preview</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Changes reflect instantly. Click the card to flip views.
            </p>
          </div>
          
          <div className="py-8 bg-slate-100/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl w-full flex items-center justify-center min-h-[360px] p-4 overflow-hidden">
            <WarrantyCardPreview
              jobId={draftCard.jobId}
              doctorName={draftCard.doctorName}
              patientName={draftCard.patientName}
              toothNumber={draftCard.toothNumber}
              warrantyYears={draftCard.warrantyYears}
              materialType={draftCard.materialType}
              date={draftCard.date}
              signature={profile?.signature || session?.user?.signature || ""}
              labLogo={profile?.labLogo || session?.user?.labLogo || ""}
              labName={profile?.labName || session?.user?.labName || "32 Dental Design"}
              labPhone={profile?.labPhone || "+91 12345 67890"}
              labEmail={profile?.labEmail || "info@yourlab.com"}
              labWebsite={profile?.labWebsite || "www.yourlab.com"}
              labAddress={profile?.labAddress || ""}
              cardBgImage={draftCard.cardBgImage || profile?.cardBgImage || ""}
              layoutFront={draftCard.layoutFront || "default"}
              layoutBack={draftCard.layoutBack || "default"}
              fontStyle={draftCard.fontStyle || "inter"}
              primaryColor={draftCard.primaryColor || "#0f52ba"}
            />
          </div>
        </div>

      </div>

    </div>
  );
}

export default function CreateCardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dent-blue-500"></div>
      </div>
    }>
      <CreateCardContent />
    </Suspense>
  );
}
