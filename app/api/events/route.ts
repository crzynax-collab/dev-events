import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Event } from "@/database";
import { v2 as cloudinary } from "cloudinary";
import { Tags } from "lucide-react";
  
// Configure Cloudinary using environment variables (must be provided in production)
// Cloudinary automatically reads from CLOUDINARY_URL env var

const MAX_IMAGE_BYTES = Number(process.env.MAX_IMAGE_BYTES) || 5 * 1024 * 1024; // default 5MB

export async function POST(req: Request) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let eventData: Record<string, any> = {};

    let tags: string[] = [];
    let agenda: string[] = [];

    /* ==================================================
       HANDLE FORM-DATA (Postman + File Upload)
    ================================================== */
    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        // Body could not be parsed as FormData – likely wrong encoding on the client
        return NextResponse.json(
          {
            message:
              "Failed to parse body as form-data. Ensure the request is sent as multipart/form-data.",
          },
          { status: 400 }
        );
      }

      /* ---------- IMAGE (REQUIRED) ---------- */
      const file = formData.get("image");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { message: "Image file is required" },
          { status: 400 }
        );
      }

      /* ---------- TAGS AND AGENDA ---------- */
      const rawTags = formData.get("tags") as string;
      const rawAgenda = formData.get("agenda") as string;

      // Try to parse as JSON array, otherwise split by comma
      try {
        const parsedTags = JSON.parse(rawTags);
        if (Array.isArray(parsedTags)) {
          tags = parsedTags.map((t: any) => String(t).trim()).filter(Boolean);
        } else {
          tags = rawTags.split(",").map(t => t.trim()).filter(Boolean);
        }
      } catch {
        tags = rawTags.split(",").map(t => t.trim()).filter(Boolean);
      }

      try {
        const parsedAgenda = JSON.parse(rawAgenda);
        if (Array.isArray(parsedAgenda)) {
          agenda = parsedAgenda.map((a: any) => String(a).trim()).filter(Boolean);
        } else {
          agenda = rawAgenda.split(",").map(a => a.trim()).filter(Boolean);
        }
      } catch {
        agenda = rawAgenda.split(",").map(a => a.trim()).filter(Boolean);
      }

      eventData.tags = tags;
      eventData.agenda = agenda;

      /* ---------- MODE (EXPLICIT & SAFE) ---------- */
      const rawMode = formData.get("mode");
      if (!rawMode || typeof rawMode !== "string") {
        return NextResponse.json(
          { message: "mode is required" },
          { status: 400 }
        );
      }

      const m = rawMode.toLowerCase().trim();
      if (m === "online" || m === "offline" || m === "hybrid") {
        eventData.mode = m;
      } else if (m.includes("hybrid")) {
        eventData.mode = "hybrid";
      } else if (m.includes("online")) {
        eventData.mode = "online";
      } else if (m.includes("offline") || m.includes("in-person")) {
        eventData.mode = "offline";
      } else {
        return NextResponse.json(
          { message: "Invalid mode value" },
          { status: 400 }
        );
      }

      /* ---------- OTHER TEXT FIELDS ---------- */
      for (const [key, value] of formData.entries()) {
        if (
          typeof value === "string" &&
          key !== "image" &&
          key !== "mode"
        ) {
          eventData[key] = value.trim();
        }
      }

      /* ---------- CLOUDINARY UPLOAD (validated) ---------- */
      // Basic validations: must be an image and under MAX_IMAGE_BYTES
      const fileType = (file as File).type || "";
      const fileSize = (file as File).size || 0;

      if (!fileType.startsWith("image/")) {
        return NextResponse.json(
          { message: "Uploaded file must be an image" },
          { status: 400 }
        );
      }

      if (fileSize > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { message: `Image exceeds max size of ${MAX_IMAGE_BYTES} bytes` },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "DevEvent", resource_type: "image" },
                (error, result) => {
                  if (error || !result) reject(error);
                  else resolve(result as { secure_url: string });
                }
              )
              .end(buffer);
          }
        );

        eventData.image = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    /* ==================================================
       HANDLE RAW JSON (NO FILE)
    ================================================== */
    else {
      try {
        eventData = await req.json();
      } catch {
        return NextResponse.json(
          { message: "Invalid JSON body" },
          { status: 400 }
        );
      }
    }

    /* ==================================================
       PARSE ARRAYS
    ================================================== */
    // Helper function to parse array fields
    const parseArrayField = (field: any): string[] => {
      if (Array.isArray(field)) {
        return field.map((item: any) => String(item).trim()).filter(Boolean);
      }
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            return parsed.map((item: any) => String(item).trim()).filter(Boolean);
          }
        } catch {
          // Not JSON, split by comma
        }
        return field.split(",").map((item: string) => item.trim()).filter(Boolean);
      }
      return [];
    };

    eventData.agenda = parseArrayField(eventData.agenda);
    eventData.tags = parseArrayField(eventData.tags);

    /* ==================================================
       REQUIRED FIELD CHECK (MODE EXCLUDED)
    ================================================== */
    const requiredFields = [
      "title",
      "description",
      "overview",
      "image",
      "venue",
      "location",
      "date",
      "time",
      "audience",
      "agenda",
      "organizer",
      "tags",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !eventData[field] ||
        (Array.isArray(eventData[field]) &&
          eventData[field].length === 0)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    /* ==================================================
       SAVE TO DATABASE
    ================================================== */
    const event = new Event(eventData);
    const saved = await event.save();

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: {
          id: saved._id.toString(),
          title: saved.title,
          slug: saved.slug,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Event creation error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: Object.values(error.errors).map(
            (e: any) => e.message
          ),
        },
        { status: 400 }
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          message: "Duplicate event",
          error: "Event with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Event creation failed",
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
      await connectDB()

      const events  = await Event.find().sort({createdAt: -1});
      
      return NextResponse.json({message:'event fetched successfully',events},{status:200});  


  } catch (error) {
    console.error("Event fetching failed:", error);
    return NextResponse.json({ message: "event fetching failed" }, { status: 500 });
  }
}