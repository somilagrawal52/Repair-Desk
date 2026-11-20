import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const attachments = await dbService.getAttachments(ticketId);
    return NextResponse.json({ success: true, photos: attachments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load photos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const ticket = await dbService.getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;
    let mimeType = "image/jpeg";
    let category: "intake" | "diagnosis" | "repair" | "handover" = "intake";
    let caption = "";
    let staffId: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No image file provided" },
          { status: 400 }
        );
      }

      category = (formData.get("category") as any) || "intake";
      caption = (formData.get("caption") as string) || "";
      staffId = (formData.get("staffId") as string) || undefined;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type || "image/jpeg";

      const extension = path.extname(file.name) || ".jpg";
      const uniqueName = `intake-${ticket.ticket_number}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}${extension}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueName}`;
    } else {
      // JSON body (for base64 / camera capture)
      const body = await request.json();
      if (!body.image_data) {
        return NextResponse.json(
          { success: false, error: "image_data is required" },
          { status: 400 }
        );
      }

      fileName = body.file_name || `photo-${Date.now()}.jpg`;
      category = body.category || "intake";
      caption = body.caption || "";
      staffId = body.staffId;

      const base64Data = body.image_data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      fileSize = buffer.length;
      mimeType = body.mime_type || "image/jpeg";

      const uniqueName = `intake-${ticket.ticket_number}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.jpg`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueName}`;
    }

    const attachment = await dbService.addAttachment(ticketId, {
      category,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      uploaded_by: staffId || null,
    });

    return NextResponse.json({ success: true, photo: attachment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload photo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
