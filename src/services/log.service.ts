import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function createLog(
  userId: string,
  userName: string,
  action: string,
  details: string = "",
  ipAddress: string = ""
) {
  try {
    await dbConnect();
    await ActivityLog.create({
      userId,
      userName,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}
