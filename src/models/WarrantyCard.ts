import mongoose, { Schema, model, models } from "mongoose";

const WarrantyCardSchema = new Schema(
  {
    jobId: {
      type: String,
      required: [true, "Job ID is required"],
      unique: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    toothNumber: {
      type: String,
      required: [true, "Tooth designation is required"],
      trim: true,
    },
    warrantyYears: {
      type: Number,
      required: [true, "Warranty duration in years is required"],
      min: [1, "Warranty must be at least 1 year"],
    },
    materialType: {
      type: String,
      required: [true, "Material type is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Card issuance date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
      default: "", // base64 card-specific signature
    },
    labLogo: {
      type: String,
      default: "", // base64 card-specific logo
    },
    labPhone: {
      type: String,
      default: "",
    },
    labEmail: {
      type: String,
      default: "",
    },
    labWebsite: {
      type: String,
      default: "",
    },
    labAddress: {
      type: String,
      default: "",
    },
    cardBgImage: {
      type: String,
      default: "", // base64 card-specific background image
    },
    layoutFront: {
      type: String,
      default: "default",
    },
    layoutBack: {
      type: String,
      default: "default",
    },
    fontStyle: {
      type: String,
      default: "inter",
    },
    primaryColor: {
      type: String,
      default: "#0f52ba",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

if (models.WarrantyCard) {
  delete (models as any).WarrantyCard;
}

const WarrantyCard = model("WarrantyCard", WarrantyCardSchema);

export default WarrantyCard;
