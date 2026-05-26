import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Find the primary admin account or the first registered user in the database
    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 })
      || await User.findOne().sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      labLogo: admin?.labLogo || "",
      labName: admin?.labName || "32 Dental Design",
    });
  } catch (error: any) {
    console.error("Fetch logo API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
