import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    const query: any = {};
    if (session.user.role !== "admin") {
      query.userId = session.user.id;
    }

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(100); // Caps logs list to the 100 most recent actions

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("GET Activity Logs Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
