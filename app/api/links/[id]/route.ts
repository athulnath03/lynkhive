import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

// GET /api/links/:id
export async function GET(_req: NextRequest, { params }: any) {
  const id = params.id;

  const link = await storage.getLink(id);

  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(link);
}

// DELETE /api/links/:id
export async function DELETE(_req: NextRequest, { params }: any) {
  const id = params.id;

  await storage.deleteLink(id);

  return NextResponse.json({ success: true });
}
