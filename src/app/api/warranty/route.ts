import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import WarrantyCard from "@/models/WarrantyCard";
import User from "@/models/User";
import { warrantyCardSchema } from "@/validations/warranty.schema";
import { createLog } from "@/services/log.service";

export async function POST(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = warrantyCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { 
      jobId, doctorName, patientName, toothNumber, warrantyYears, materialType, date, notes, signature, labLogo,
      labPhone, labEmail, labWebsite, labAddress, cardBgImage, layoutFront, layoutBack, fontStyle, primaryColor
    } = validationResult.data;

    await dbConnect();

    // Check for duplicate Job ID
    const duplicate = await WarrantyCard.findOne({ jobId: jobId.trim() });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `Warranty card with Job ID "${jobId}" already exists.` },
        { status: 409 }
      );
    }

    // Query user profile from DB to resolve branding defaults
    const userDoc = await User.findById(session.user.id);

    // Save with the authenticated user reference
    const card = await WarrantyCard.create({
      jobId: jobId.trim(),
      doctorName: doctorName.trim(),
      patientName: patientName.trim(),
      toothNumber: toothNumber.trim(),
      warrantyYears,
      materialType,
      date: new Date(date),
      notes: notes?.trim() || "",
      signature: signature || userDoc?.signature || "",
      labLogo: labLogo || userDoc?.labLogo || "",
      labPhone: labPhone || userDoc?.labPhone || "+91 12345 67890",
      labEmail: labEmail || userDoc?.labEmail || "info@yourlab.com",
      labWebsite: labWebsite || userDoc?.labWebsite || "www.yourlab.com",
      labAddress: labAddress || userDoc?.labAddress || "",
      cardBgImage: cardBgImage || userDoc?.cardBgImage || "",
      layoutFront: layoutFront || "default",
      layoutBack: layoutBack || "default",
      fontStyle: fontStyle || "inter",
      primaryColor: primaryColor || "#0f52ba",
      createdBy: session.user.id,
    });

    // Create Audit Log
    await createLog(
      session.user.id,
      session.user.name || "System User",
      "Created Card",
      `Created warranty certificate for Patient: ${patientName}, Job ID: ${jobId}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create warranty card" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const material = searchParams.get("material") || "";
    const years = searchParams.get("years") || "";

    const skip = (page - 1) * limit;

    await dbConnect();

    // Query scoping: non-admins can only see their own generated cards
    const query: any = {};
    if (session.user.role !== "admin") {
      query.createdBy = session.user.id;
    }

    // Search filter (patient, doctor, or Job ID)
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
        { jobId: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (material) {
      query.materialType = material;
    }
    if (years) {
      query.warrantyYears = parseInt(years);
    }

    const total = await WarrantyCard.countDocuments(query);
    const cards = await WarrantyCard.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email labName");

    return NextResponse.json({
      success: true,
      data: cards,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query cards" },
      { status: 500 }
    );
  }
}
