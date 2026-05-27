import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import Template from "@/models/Template";
import { templateSchema } from "@/validations/template.schema";
import { createLog } from "@/services/log.service";

export async function POST(req: Request) {
  try {
    const session = await getSessionServer();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = templateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, doctorName, warrantyYears, materialType, notes, cardBgImage, layoutFront, layoutBack, fontStyle, primaryColor } = validationResult.data;

    await dbConnect();

    const template = await Template.create({
      name: name.trim(),
      doctorName: doctorName?.trim() || "",
      warrantyYears: warrantyYears ?? 5,
      materialType: materialType?.trim() || "",
      notes: notes?.trim() || "",
      cardBgImage: cardBgImage || "",
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
      "Created Template",
      `Created warranty template: ${name}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: any) {
    console.error("POST Templates API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create template" },
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

    const skip = (page - 1) * limit;

    await dbConnect();

    // Query scoping: non-admins can only see their own templates
    const query: any = {};
    if (session.user.role !== "admin") {
      query.createdBy = session.user.id;
    }

    // Search filter (template name, material type, or doctor preset)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { materialType: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Template.countDocuments(query);
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email labName");

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET Templates API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query templates" },
      { status: 500 }
    );
  }
}
