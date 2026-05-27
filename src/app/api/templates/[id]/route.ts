import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import Template from "@/models/Template";
import { templateSchema } from "@/validations/template.schema";
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
    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Auth check: non-admins cannot read other users' templates
    if (session.user.role !== "admin" && template.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized template access" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    console.error("GET Single Template Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch template details" },
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

    const validationResult = templateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();
    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Ownership check
    if (session.user.role !== "admin" && template.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized template modification" }, { status: 403 });
    }

    // Update fields
    const updatedData = validationResult.data;
    
    template.name = updatedData.name.trim();
    template.doctorName = updatedData.doctorName?.trim() || "";
    template.warrantyYears = updatedData.warrantyYears ?? 5;
    template.materialType = updatedData.materialType?.trim() || "";
    template.notes = updatedData.notes?.trim() || "";
    template.cardBgImage = updatedData.cardBgImage || "";
    template.layoutFront = updatedData.layoutFront || "default";
    template.layoutBack = updatedData.layoutBack || "default";
    template.fontStyle = updatedData.fontStyle || "inter";
    template.primaryColor = updatedData.primaryColor || "#0f52ba";

    await template.save();

    // Audit Log
    await createLog(
      session.user.id,
      session.user.name || "System User",
      "Updated Template",
      `Modified warranty template details: ${updatedData.name}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    console.error("PUT Single Template Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update template details" },
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
    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Ownership check
    if (session.user.role !== "admin" && template.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized template deletion" }, { status: 403 });
    }

    const templateName = template.name;

    await Template.findByIdAndDelete(id);

    // Audit Log
    await createLog(
      session.user.id,
      session.user.name || "System User",
      "Deleted Template",
      `Removed warranty template: ${templateName}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, message: "Template successfully deleted" });
  } catch (error: any) {
    console.error("DELETE Single Template Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
