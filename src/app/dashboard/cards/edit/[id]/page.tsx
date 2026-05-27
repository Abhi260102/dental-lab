"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import { useWarrantyStore } from "@/store/use-warranty-store";
import WarrantyForm from "@/components/warranty/warranty-form";
import WarrantyCardPreview from "@/components/warranty/warranty-card-preview";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

interface EditCardPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCardPage({ params }: EditCardPageProps) {
  // Resolve params asynchronously for Next.js 15
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cardData, setCardData] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const draftCard = useWarrantyStore((state) => state.draftCard);
  const setDraftCard = useWarrantyStore((state) => state.setDraftCard);

  useEffect(() => {
    async function fetchCardDetails() {
      try {
        const res = await fetch(`/api/warranty/${id}`);
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || "Failed to load card details");
        }
        
        setCardData(json.data);
        setDraftCard(json.data);
      } catch (error: any) {
        toast({
          title: "Error Loading Card",
          description: error.message || "Failed to fetch warranty details.",
          variant: "destructive",
        });
        router.push("/dashboard/cards");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCardDetails();
    }
  }, [id, router, toast, setDraftCard]);

  const handleSubmit = async (data: any) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/warranty/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cardData,
          ...data,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update card");
      }

      toast({
        title: "Certificate Updated",
        description: `Warranty card for ${data.patientName} successfully saved.`,
        variant: "success",
      });

      router.push("/dashboard/cards");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "Failed to save card modifications.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-t-dent-blue-500 border-r-transparent border-slate-200 dark:border-slate-800 animate-spin" />
          <p className="text-xs text-slate-500">Loading certificate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/cards"
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warranty Certificates</span>
          <h2 className="text-lg font-bold text-slate-850 dark:text-white leading-tight">Edit Warranty Certificate</h2>
        </div>
      </div>

      {/* Split grid display */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Edit Form */}
        <div className="xl:col-span-5 order-2 xl:order-1">
          <Card>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="w-4.5 h-4.5 text-emerald-500" />
                Modify Parameters
              </CardTitle>
              <CardDescription>
                Make changes to patient restoration credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <WarrantyForm 
                onSubmit={handleSubmit} 
                isLoading={isUpdating} 
                defaultValues={cardData}
                submitLabel="Save Modifications"
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
              signature={draftCard.signature || profile?.signature || session?.user?.signature || ""}
              labLogo={draftCard.labLogo || profile?.labLogo || session?.user?.labLogo || ""}
              labName={profile?.labName || session?.user?.labName || "32 Dental Design"}
              labPhone={draftCard.labPhone || profile?.labPhone || "+91 12345 67890"}
              labEmail={draftCard.labEmail || profile?.labEmail || "info@yourlab.com"}
              labWebsite={draftCard.labWebsite || profile?.labWebsite || "www.yourlab.com"}
              labAddress={draftCard.labAddress || profile?.labAddress || ""}
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
