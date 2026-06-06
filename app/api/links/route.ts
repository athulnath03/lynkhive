/**
 * app/api/links/route.ts
 *
 * GET    /api/links   → getLinks()
 * POST   /api/links   → addLink()
 * PATCH  /api/links   → updateLink()  (id in request body)
 * DELETE /api/links   → deleteLink()  (id in query param)
 *
 * This route only imports from @/lib/storage — never from @supabase/supabase-js.
 */

import { NextRequest, NextResponse } from "next/server";
import { storage, NotFoundError } from "@/lib/storage";
import { CreateLinkPayload, UpdateLinkPayload } from "@/types";

// ── GET /api/links ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const links = await storage.getLinks();
    return NextResponse.json(links);
  } catch (err) {
    return serverError("getLinks", err);
  }
}

// ── POST /api/links ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CreateLinkPayload = await req.json();

    if (!body.title?.trim())    return bad("title is required");
    if (!body.url?.trim())      return bad("url is required");
    if (!body.category)         return bad("category is required");

    try { new URL(body.url); }
    catch { return bad("url must be a valid URL (include https://)"); }

    const link = await storage.addLink(body);
    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    return serverError("addLink", err);
  }
}

// ── PATCH /api/links ───────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...payload }: { id: string } & UpdateLinkPayload = await req.json();
    if (!id) return bad("id is required");

    const updated = await storage.updateLink(id, payload);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return serverError("updateLink", err);
  }
}

// ── DELETE /api/links ──────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return bad("id query param is required");

    await storage.deleteLink(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("deleteLink", err);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function serverError(op: string, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(`[api/links] ${op}:`, message);
  return NextResponse.json({ error: message }, { status: 500 });
}
