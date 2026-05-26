"use client";

import { useEffect } from "react";
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
}

export default function WarrantyForm({
  onSubmit,
  isLoading,
  defaultValues,
  submitLabel = "Generate Warranty Card",
}: WarrantyFormProps) {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const setDraftCard = useWarrantyStore((state) => state.setDraftCard);
  const resetDraftCard = useWarrantyStore((state) => state.resetDraftCard);

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
    },
  });

  // Initialize draft details in Zustand store
  useEffect(() => {
    const values = getValues();
    setDraftCard({
      ...values,
      signature: values.signature || profile?.signature || session?.user?.signature || "",
      labLogo: values.labLogo || profile?.labLogo || session?.user?.labLogo || "",
    });
  }, [session, profile, setDraftCard, getValues]);

  // Subscribe to changes in form inputs to update store dynamically
  useEffect(() => {
    const subscription = watch((values) => {
      setDraftCard({
        ...values,
        signature: values.signature || profile?.signature || session?.user?.signature || "",
        labLogo: values.labLogo || profile?.labLogo || session?.user?.labLogo || "",
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
