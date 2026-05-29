import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Template from "@/models/Template";

export async function GET() {
  try {
    await dbConnect();

    const userWithLogo = await User.findOne({
      email: "abc@yopmail.com",
      labLogo: { $exists: true, $nin: ["", null] }
    }).sort({ updatedAt: -1 });

    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 })
      || await User.findOne().sort({ createdAt: 1 });

    const targetUser = userWithLogo || admin;

    let defaultTemplate = null;
    if (targetUser) {
      defaultTemplate = await Template.findOne({
        createdBy: targetUser._id,
        isDefault: true,
      });
    }
    if (!defaultTemplate) {
      // Fallback to any default template in DB
      defaultTemplate = await Template.findOne({ isDefault: true }).sort({ updatedAt: -1 });
    }

    if (userWithLogo) {
      return NextResponse.json({
        success: true,
        labLogo: userWithLogo.labLogo,
        labName: userWithLogo.labName || "32 Dental Design",
        labPhone: userWithLogo.labPhone || "+91 12345 67890",
        labEmail: userWithLogo.labEmail || "info@yourlab.com",
        labWebsite: userWithLogo.labWebsite || "www.yourlab.com",
        labAddress: userWithLogo.labAddress || "",
        cardBgImage: defaultTemplate ? (defaultTemplate.cardBgImage || userWithLogo.cardBgImage || "") : (userWithLogo.cardBgImage || ""),
        layoutFront: defaultTemplate?.layoutFront || "default",
        layoutBack: defaultTemplate?.layoutBack || "default",
        fontStyle: defaultTemplate?.fontStyle || "inter",
        primaryColor: defaultTemplate?.primaryColor || "#0f52ba",
        warrantyYears: defaultTemplate?.warrantyYears ?? 10,
        materialType: defaultTemplate?.materialType || "Zirconia Premium",
        doctorName: defaultTemplate?.doctorName || "Dr. John Smith",
      });
    }

    return NextResponse.json({
      success: true,
      labLogo: admin?.labLogo || "",
      labName: admin?.labName || "32 Dental Design",
      labPhone: admin?.labPhone || "+91 12345 67890",
      labEmail: admin?.labEmail || "info@yourlab.com",
      labWebsite: admin?.labWebsite || "www.yourlab.com",
      labAddress: admin?.labAddress || "",
      cardBgImage: defaultTemplate ? (defaultTemplate.cardBgImage || admin?.cardBgImage || "") : (admin?.cardBgImage || ""),
      layoutFront: defaultTemplate?.layoutFront || "default",
      layoutBack: defaultTemplate?.layoutBack || "default",
      fontStyle: defaultTemplate?.fontStyle || "inter",
      primaryColor: defaultTemplate?.primaryColor || "#0f52ba",
      warrantyYears: defaultTemplate?.warrantyYears ?? 10,
      materialType: defaultTemplate?.materialType || "Zirconia Premium",
      doctorName: defaultTemplate?.doctorName || "Dr. John Smith",
    });
  } catch (error: any) {
    console.error("Fetch logo API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
