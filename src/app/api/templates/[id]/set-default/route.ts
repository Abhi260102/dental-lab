import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import Template from "@/models/Template";
import { createLog } from "@/services/log.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await context.params;

    await dbConnect();

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Ownership check
    if (session.user.role !== "admin" && template.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized template modification" }, { status: 403 });
    }

    const willBeDefault = !template.isDefault;

    if (willBeDefault) {
      // Unset all other defaults for this user first
      await Template.updateMany(
        { createdBy: session.user.id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    template.isDefault = willBeDefault;
    await template.save();

    await createLog(
      session.user.id,
      session.user.name || "System User",
      willBeDefault ? "Set Default Template" : "Unset Default Template",
      `${willBeDefault ? "Marked" : "Unmarked"} template "${template.name}" as default`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({
      success: true,
      isDefault: willBeDefault,
      message: willBeDefault
        ? `"${template.name}" is now your default template`
        : `"${template.name}" removed from default`,
    });
  } catch (error: any) {
    console.error("PATCH Set-Default Template Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update default status" },
      { status: 500 }
    );
  }
}
