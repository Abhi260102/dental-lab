import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createLog } from "@/services/log.service";

export async function GET(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        labName: user.labName,
        labLogo: user.labLogo || "",
        signature: user.signature || "",
        labPhone: user.labPhone || "+91 12345 67890",
        labEmail: user.labEmail || "info@yourlab.com",
        labWebsite: user.labWebsite || "www.yourlab.com",
        labAddress: user.labAddress || "",
        cardBgImage: user.cardBgImage || "",
        termsAndConditions: user.termsAndConditions || "1. This warranty certificate is valid only for genuine restorations fabricated by our laboratory.\n2. The warranty covers manufacturing defects under normal clinical conditions and wear.\n3. Damages caused by clinical preparation errors, patient accidents, neglect, or subsequent dental modifications are excluded.",
      },
    });
  } catch (error: any) {
    console.error("GET Profile Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve profile settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { name, labName, labLogo, signature, password, labPhone, labEmail, labWebsite, labAddress, cardBgImage, termsAndConditions } = await req.json();

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Update basic text fields
    if (name) user.name = name.trim();
    if (labName) user.labName = labName.trim();
    if (labPhone !== undefined) user.labPhone = labPhone.trim();
    if (labEmail !== undefined) user.labEmail = labEmail.trim();
    if (labWebsite !== undefined) user.labWebsite = labWebsite.trim();
    if (labAddress !== undefined) user.labAddress = labAddress.trim();
    if (termsAndConditions !== undefined) user.termsAndConditions = termsAndConditions;
    
    // Update logo/signature/background base64 if provided
    if (labLogo !== undefined) user.labLogo = labLogo;
    if (signature !== undefined) user.signature = signature;
    if (cardBgImage !== undefined) user.cardBgImage = cardBgImage;

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    // Create Audit Log
    await createLog(
      session.user.id,
      user.name,
      "Updated Settings",
      "Modified profile branding details and/or signature authorization",
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        labName: user.labName,
        labLogo: user.labLogo,
        signature: user.signature,
        labPhone: user.labPhone,
        labEmail: user.labEmail,
        labWebsite: user.labWebsite,
        labAddress: user.labAddress,
        cardBgImage: user.cardBgImage,
        termsAndConditions: user.termsAndConditions,
      },
    });
  } catch (error: any) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
