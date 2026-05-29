import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    labName: {
      type: String,
      default: "32 Dental Design",
    },
    labLogo: {
      type: String,
      default: "", // base64 representation of lab logo
    },
    signature: {
      type: String,
      default: "", // base64 representation of default signature
    },
    labPhone: {
      type: String,
      default: "+91 12345 67890",
    },
    labEmail: {
      type: String,
      default: "info@yourlab.com",
    },
    labWebsite: {
      type: String,
      default: "www.yourlab.com",
    },
    labAddress: {
      type: String,
      default: "",
    },
    cardBgImage: {
      type: String,
      default: "", // base64 representation of custom background image
    },
    termsAndConditions: {
      type: String,
      default: "1. This warranty certificate is valid only for genuine restorations fabricated by our laboratory.\n2. The warranty covers manufacturing defects under normal clinical conditions and wear.\n3. Damages caused by clinical preparation errors, patient accidents, neglect, or subsequent dental modifications are excluded.",
    },
  },
  {
    timestamps: true,
  }
);

if (models.User) {
  delete (models as any).User;
}

const User = model("User", UserSchema);

export default User;
