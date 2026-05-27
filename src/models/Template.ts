import mongoose, { Schema, model, models } from "mongoose";

const TemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    doctorName: {
      type: String,
      default: "",
      trim: true,
    },
    warrantyYears: {
      type: Number,
      default: 5,
      min: [1, "Warranty must be at least 1 year"],
    },
    materialType: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    cardBgImage: {
      type: String,
      default: "",
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
    isDefault: {
      type: Boolean,
      default: false,
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

if (models.Template) {
  delete (models as any).Template;
}

const Template = model("Template", TemplateSchema);

export default Template;
