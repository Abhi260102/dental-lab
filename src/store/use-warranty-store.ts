import { create } from "zustand";
import { WarrantyCardInput } from "@/validations/warranty.schema";

interface WarrantyStore {
  draftCard: WarrantyCardInput;
  setDraftCard: (card: Partial<WarrantyCardInput>) => void;
  resetDraftCard: (defaultValues?: Partial<WarrantyCardInput>) => void;
}

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const initialDraft: WarrantyCardInput = {
  jobId: "",
  doctorName: "",
  patientName: "",
  toothNumber: "",
  warrantyYears: 5,
  materialType: "Zirconia Premium",
  date: getTodayDateString(),
  notes: "",
  signature: "",
  labLogo: "",
  layoutFront: "default",
  layoutBack: "default",
  fontStyle: "inter",
  primaryColor: "#0f52ba",
};

export const useWarrantyStore = create<WarrantyStore>((set) => ({
  draftCard: initialDraft,
  setDraftCard: (card) =>
    set((state) => ({
      draftCard: { ...state.draftCard, ...card },
    })),
  resetDraftCard: (defaultValues) =>
    set(() => ({
      draftCard: { 
        ...initialDraft, 
        date: getTodayDateString(), // Ensure fresh date
        ...defaultValues 
      },
    })),
}));
