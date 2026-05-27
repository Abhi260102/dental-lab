"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import { warrantyCardSchema, WarrantyCardInput } from "@/validations/warranty.schema";
import { useWarrantyStore } from "@/store/use-warranty-store";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import FdiToothSelector from "./fdi-tooth-selector";

interface WarrantyFormProps {
  onSubmit: (data: WarrantyCardInput) => void;
  isLoading: boolean;
  defaultValues?: Partial<WarrantyCardInput>;
  submitLabel?: string;
  initialTemplateId?: string;
}

export default function WarrantyForm({
  onSubmit,
  isLoading,
  defaultValues,
  submitLabel = "Generate Warranty Card",
  initialTemplateId,
}: WarrantyFormProps) {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const setDraftCard = useWarrantyStore((state) => state.setDraftCard);
  const resetDraftCard = useWarrantyStore((state) => state.resetDraftCard);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || "");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/templates?limit=100")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setTemplates(json.data);
          }
        })
        .catch((err) => console.error("Error loading templates in form:", err));
    }
  }, [session]);

  // When initialTemplateId is provided (coming from templates page), apply its styles once templates load
  useEffect(() => {
    if (initialTemplateId && templates.length > 0) {
      const template = templates.find((t) => t._id === initialTemplateId);
      if (template) {
        setValue("cardBgImage", template.cardBgImage || "", { shouldValidate: true });
        setValue("layoutFront", template.layoutFront || "default", { shouldValidate: true });
        setValue("layoutBack", template.layoutBack || "default", { shouldValidate: true });
        setValue("fontStyle", template.fontStyle || "inter", { shouldValidate: true });
        setValue("primaryColor", template.primaryColor || "#0f52ba", { shouldValidate: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId, templates]);

  // In edit mode: auto-match the card's styling to a saved template and pre-select it in the dropdown
  useEffect(() => {
    if (!initialTemplateId && defaultValues && templates.length > 0 && !selectedTemplateId) {
      const cardLayout     = defaultValues.layoutFront  || "default";
      const cardLayoutBack = defaultValues.layoutBack   || "default";
      const cardFont       = defaultValues.fontStyle    || "inter";
      const cardColor      = (defaultValues.primaryColor || "#0f52ba").toLowerCase();

      const matched = templates.find((t) =>
        (t.layoutFront  || "default") === cardLayout &&
        (t.layoutBack   || "default") === cardLayoutBack &&
        (t.fontStyle    || "inter")   === cardFont &&
        (t.primaryColor || "#0f52ba").toLowerCase() === cardColor
      );

      if (matched) {
        setSelectedTemplateId(matched._id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, defaultValues]);

  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
    reset,
    control,
  } = useForm<WarrantyCardInput>({
    resolver: zodResolver(warrantyCardSchema),
    defaultValues: {
      jobId: defaultValues?.jobId || "",
      doctorName: defaultValues?.doctorName || "",
      patientName: defaultValues?.patientName || "",
      toothNumber: defaultValues?.toothNumber || "",
      warrantyYears: defaultValues?.warrantyYears || 5,
      materialType: defaultValues?.materialType || "Zirconia Premium",
      date: defaultValues?.date 
        ? new Date(defaultValues.date).toISOString().split("T")[0] 
        : getTodayDateString(),
      notes: defaultValues?.notes || "",
      signature: defaultValues?.signature || profile?.signature || session?.user?.signature || "",
      labLogo: defaultValues?.labLogo || profile?.labLogo || session?.user?.labLogo || "",
      cardBgImage: defaultValues?.cardBgImage || "",
      layoutFront: defaultValues?.layoutFront || "default",
      layoutBack: defaultValues?.layoutBack || "default",
      fontStyle: defaultValues?.fontStyle || "inter",
      primaryColor: defaultValues?.primaryColor || "#0f52ba",
    },
  });

  // Initialize draft details in Zustand store
  useEffect(() => {
    const values = getValues();
    setDraftCard({
      ...values,
      signature: values.signature || profile?.signature || session?.user?.signature || "",
      labLogo: values.labLogo || profile?.labLogo || session?.user?.labLogo || "",
      cardBgImage: values.cardBgImage || "",
      layoutFront: values.layoutFront || "default",
      layoutBack: values.layoutBack || "default",
      fontStyle: values.fontStyle || "inter",
      primaryColor: values.primaryColor || "#0f52ba",
    });
  }, [session, profile, setDraftCard, getValues]);

  // Subscribe to changes in form inputs to update store dynamically
  useEffect(() => {
    const subscription = watch((values) => {
      setDraftCard({
        ...values,
        signature: values.signature || profile?.signature || session?.user?.signature || "",
        labLogo: values.labLogo || profile?.labLogo || session?.user?.labLogo || "",
        cardBgImage: values.cardBgImage || "",
      } as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, session, profile, setDraftCard]);

  // Handle defaults change (e.g. edit mode loads data after initial mount)
  useEffect(() => {
    if (defaultValues) {
      const resetValues = {
        ...defaultValues,
        date: defaultValues.date 
          ? new Date(defaultValues.date).toISOString().split("T")[0] 
          : getTodayDateString(),
        signature: defaultValues.signature || profile?.signature || session?.user?.signature || "",
        labLogo: defaultValues.labLogo || profile?.labLogo || session?.user?.labLogo || "",
        cardBgImage: defaultValues.cardBgImage || "",
        layoutFront: defaultValues.layoutFront || "default",
        layoutBack: defaultValues.layoutBack || "default",
        fontStyle: defaultValues.fontStyle || "inter",
        primaryColor: defaultValues.primaryColor || "#0f52ba",
      };
      reset(resetValues as any);
      setDraftCard(resetValues);
    }
  }, [defaultValues, reset, session, profile, setDraftCard]);

  // Generator helper for Job IDs
  const handleAutoGenerateId = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const dateCode = new Date().toISOString().split("T")[0].replace(/-/g, "").slice(2, 6);
    const newId = `DS-${dateCode}-${randomHex}`;
    setValue("jobId", newId, { shouldValidate: true });
  };

  const materialOptions = [
    { value: "PFM (IVO)", label: "PFM (IVO)" },
    { value: "CAD CAM PFM", label: "CAD CAM PFM" },
    { value: "DMLS CO-CR PFM", label: "DMLS CO-CR PFM" },
    { value: "ORIZIN BASIC", label: "ORIZIN BASIC" },
    { value: "ORIZIN STANDARD", label: "ORIZIN STANDARD" },
    { value: "ORIZIN CLASSIC", label: "ORIZIN CLASSIC" },
    { value: "ORIZIN NEXXZRT LT.M", label: "ORIZIN NEXXZRT LT.M" },
    { value: "CERCON LT.M", label: "CERCON LT.M" },
    { value: "ORIZIN ZIRCAD PRIME", label: "ORIZIN ZIRCAD PRIME" },
    { value: "ORIZIN ZIRCAD PRIME ESTHETIC", label: "ORIZIN ZIRCAD PRIME ESTHETIC" },
    { value: "Zirconia Premium", label: "Zirconia Premium (High Translucent)" },
    { value: "Zirconia Multi-layer", label: "Zirconia Multi-layer (Ultra Aesthetic)" },
    { value: "IPS e.max Press", label: "IPS e.max Press (Lithium Disilicate)" },
    { value: "PFM Noble", label: "Porcelain Fused to Metal (Noble Alloy)" },
    { value: "PFM Co-Cr", label: "Porcelain Fused to Metal (Cobalt-Chrome)" },
    { value: "Composite Crown", label: "Composite Indirect Restoration" },
    { value: "Titanium Abutment", label: "Custom Titanium Abutment" },
    { value: "PMMA Temp", label: "PMMA Temporary Restorations" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Quick Template Preset — always visible */}
      <div className="flex flex-col gap-1.5 w-full bg-slate-50/85 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Apply Design Template
        </label>
        <div className="relative">
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedTemplateId(selectedId);
              if (!selectedId) return;
              const template = templates.find((t) => t._id === selectedId);
              if (template) {
                setValue("cardBgImage", template.cardBgImage || "", { shouldValidate: true });
                setValue("layoutFront", template.layoutFront || "default", { shouldValidate: true });
                setValue("layoutBack", template.layoutBack || "default", { shouldValidate: true });
                setValue("fontStyle", template.fontStyle || "inter", { shouldValidate: true });
                setValue("primaryColor", template.primaryColor || "#0f52ba", { shouldValidate: true });
              }
            }}
            disabled={templates.length === 0}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-sm text-slate-900 dark:text-slate-100 focus:outline-none appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {templates.length === 0 ? (
              <option value="">No templates yet — create one in Templates</option>
            ) : (
              <>
                <option value="">-- Apply a Design Template --</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {selectedTemplateId && (
          <p className="text-[10px] text-emerald-500 font-semibold">
            ✓ Template styling applied — layout, font & color loaded from preset
          </p>
        )}
      </div>

      {/* Job ID Row */}
      <div className="flex gap-2 items-end">
        <div className="flex-grow">
          <Input
            label="Job ID / Certificate ID"
            placeholder="e.g. DS-2605-AF9X"
            error={errors.jobId?.message}
            {...register("jobId")}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoGenerateId}
          className="h-[42px] px-3 font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shrink-0"
          title="Auto-Generate ID"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 mr-2" />
          Generate
        </Button>
      </div>

      {/* Patient Name */}
      <Input
        label="Patient Full Name"
        placeholder="e.g. Jane Doe"
        error={errors.patientName?.message}
        {...register("patientName")}
      />

      {/* Prescribing Doctor */}
      <Input
        label="Prescribing Doctor (Dentist)"
        placeholder="e.g. Dr. Arthur Pendelton"
        error={errors.doctorName?.message}
        {...register("doctorName")}
      />

      {/* Tooth Designations (FDI Quadrant Selector) */}
      <Controller
        name="toothNumber"
        control={control}
        render={({ field }) => (
          <FdiToothSelector
            value={field.value}
            onChange={field.onChange}
            error={errors.toothNumber?.message}
          />
        )}
      />

      {/* Date & Warranty Years Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Issuance Date"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />
        <Select
          label="Warranty Term"
          options={[
            { value: 1, label: "1 Year Limit" },
            { value: 2, label: "2 Years Limit" },
            { value: 3, label: "3 Years Limit" },
            { value: 5, label: "5 Years Limit" },
            { value: 7, label: "7 Years Limit" },
            { value: 10, label: "10 Years Limit" },
            { value: 15, label: "15 Years Limit" },
            { value: 20, label: "20 Years Limit" },
            { value: 30, label: "30 Years (Lifetime Cover)" },
          ]}
          error={errors.warrantyYears?.message}
          {...register("warrantyYears", { valueAsNumber: true })}
        />
      </div>

      {/* Material Type */}
      <Select
        label="Restoration Material"
        options={materialOptions}
        error={errors.materialType?.message}
        {...register("materialType")}
      />

      {/* Remarks/Notes */}
      <Input
        label="Restoration Notes / Instructions"
        placeholder="e.g. High translucency crown, incisal characterization"
        error={errors.notes?.message}
        {...register("notes")}
      />

      {/* Hidden inputs to preserve layout and design settings in React Hook Form programmatically from templates */}
      <input type="hidden" {...register("layoutFront")} />
      <input type="hidden" {...register("layoutBack")} />
      <input type="hidden" {...register("fontStyle")} />
      <input type="hidden" {...register("primaryColor")} />
      <input type="hidden" {...register("cardBgImage")} />


      {/* Submit Action */}
      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full text-sm font-semibold tracking-wide py-3 bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 shadow-md shadow-dent-blue-500/10 active:scale-[0.99] transition-transform"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
