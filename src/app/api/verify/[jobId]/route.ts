import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WarrantyCard from "@/models/WarrantyCard";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { jobId } = await context.params;

    await dbConnect();
    const card = await WarrantyCard.findOne({ jobId: jobId.trim() })
      .populate("createdBy", "name labName labLogo labPhone labEmail labWebsite labAddress cardBgImage");

    if (!card) {
      return NextResponse.json(
        { success: false, error: "Warranty card not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    console.error("Public Verification API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error verifying card" },
      { status: 500 }
    );
  }
}
