import { NextRequest, NextResponse } from "next/server";
import { storage, NotFoundError } from "@/lib/storage";

// GET /api/links/:id
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const link = await storage.getLink(id);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(link);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/links/:id
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await storage.deleteLink(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    const message =
      err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
