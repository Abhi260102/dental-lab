import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Find the user who most recently uploaded/updated a logo
    // const userWithLogo = await User.findOne({ 
    //   labLogo: { $ne: "", $exists: true } 
    // }).sort({ updatedAt: -1 });


    const userWithLogo = await User.findOne({
      email: "abc@yopmail.com",
      labLogo: { $exists: true, $nin: ["", null] }
    }).sort({ updatedAt: -1 });

    if (userWithLogo) {
      return NextResponse.json({
        success: true,
        labLogo: userWithLogo.labLogo,
        labName: userWithLogo.labName || "32 Dental Design",
      });
    }

    // Fallback to the primary admin account or the first registered user in the database
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
