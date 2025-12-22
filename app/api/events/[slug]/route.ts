import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { Event, type IEvent } from "@/database";

// Use Node.js runtime to ensure compatibility with Mongoose
export const runtime = "nodejs";

/**
 * GET /api/events/[slug]
 *
 * Returns a single event by its slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const normalizedSlug = slug.trim();

  // Basic validation for the slug parameter
  if (!normalizedSlug) {
    return NextResponse.json(
      { message: "Slug parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Ensure we have a database connection before querying
    await connectDB();

    const event: IEvent | null = await Event.findOne({ slug: normalizedSlug })
      .select("-__v")
      .exec();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Mongoose documents implement toJSON, so they can be sent directly
    return NextResponse.json(
      { event },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log full error details server-side for debugging
    console.error("Error fetching event:", error);

    // Return a minimal, non-sensitive message to clients
    return NextResponse.json(
      { message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
