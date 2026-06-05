/**
 * app/api/links/[id]/route.ts
 *
 * GET    /api/links/:id   → getLink(id)
 * DELETE /api/links/:id   → deleteLink(id)   (alternative to ?id= on collection)
 *
 * This route only imports from @/lib/storage — never from @supabase/supabase-js.
 */

import { NextRequest, NextResponse } from "next/server";
import { storage, NotFoundError } from "@/lib/storage";

interface Params {
  params: { id: string };
}

// ── GET /api/links/:id ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const link = await storage.getLink(params.id);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/links/:id ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await storage.deleteLink(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
