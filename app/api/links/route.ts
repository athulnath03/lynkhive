import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NewLinkPayload } from "@/types";

export async function GET() {
  try {
    const links = await db.getAll();
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: NewLinkPayload = await req.json();

    // Basic validation
    if (!body.title || !body.url || !body.category) {
      return NextResponse.json(
        { error: "title, url and category are required" },
        { status: 400 }
      );
    }

    const newLink = await db.create(body);
    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
