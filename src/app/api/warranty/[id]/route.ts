import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import WarrantyCard from "@/models/WarrantyCard";
import { warrantyCardSchema } from "@/validations/warranty.schema";
import { createLog } from "@/services/log.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;

    await dbConnect();
    const card = await WarrantyCard.findById(id);

    if (!card) {
      return NextResponse.json({ success: false, error: "Warranty card not found" }, { status: 404 });
    }

    // Auth check: non-admins cannot read other users' cards
    if (session.user.role !== "admin" && card.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized card access" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    console.error("GET Single Card Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch card details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const validationResult = warrantyCardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();
    const card = await WarrantyCard.findById(id);

    if (!card) {
      return NextResponse.json({ success: false, error: "Warranty card not found" }, { status: 404 });
    }

    // Ownership check
    if (session.user.role !== "admin" && card.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized card modification" }, { status: 403 });
    }

    // Update fields
    const updatedData = validationResult.data;
    
    // Check duplicate Job ID if ID changed
    if (updatedData.jobId !== card.jobId) {
      const duplicate = await WarrantyCard.findOne({ jobId: updatedData.jobId.trim() });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Warranty card with Job ID "${updatedData.jobId}" already exists.` },
          { status: 409 }
        );
      }
    }

    card.jobId = updatedData.jobId.trim();
    card.doctorName = updatedData.doctorName.trim();
    card.patientName = updatedData.patientName.trim();
    card.toothNumber = updatedData.toothNumber.trim();
    card.warrantyYears = updatedData.warrantyYears;
    card.materialType = updatedData.materialType;
    card.date = new Date(updatedData.date);
    card.notes = updatedData.notes?.trim() || "";
    if (updatedData.signature) card.signature = updatedData.signature;
    if (updatedData.labLogo) card.labLogo = updatedData.labLogo;
    if (updatedData.labPhone) card.labPhone = updatedData.labPhone;
    if (updatedData.labEmail) card.labEmail = updatedData.labEmail;
    if (updatedData.labWebsite) card.labWebsite = updatedData.labWebsite;
    if (updatedData.labAddress !== undefined) card.labAddress = updatedData.labAddress;
    if (updatedData.cardBgImage) card.cardBgImage = updatedData.cardBgImage;

    await card.save();

    // Audit Log
    await createLog(
      session.user.id,
      session.user.name || "System User",
      "Updated Card",
      `Modified warranty details for Patient: ${updatedData.patientName}, Job ID: ${updatedData.jobId}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    console.error("PUT Single Card Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update card details" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;

    await dbConnect();
    const card = await WarrantyCard.findById(id);

    if (!card) {
      return NextResponse.json({ success: false, error: "Warranty card not found" }, { status: 404 });
    }

    // Ownership check
    if (session.user.role !== "admin" && card.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized card deletion" }, { status: 403 });
    }

    const patientName = card.patientName;
    const jobId = card.jobId;

    await WarrantyCard.findByIdAndDelete(id);

    // Audit Log
    await createLog(
      session.user.id,
      session.user.name || "System User",
      "Deleted Card",
      `Removed warranty certificate for Patient: ${patientName}, Job ID: ${jobId}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, message: "Warranty card successfully deleted" });
  } catch (error: any) {
    console.error("DELETE Single Card Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete card" },
      { status: 500 }
    );
  }
}
