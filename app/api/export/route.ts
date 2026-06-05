/**
 * app/api/export/route.ts
 *
 * GET /api/export → streams lynkhive-data.json as a browser download.
 *
 * The storage layer returns typed Link[] via exportLinks().
 * This route owns the serialization format — storage does not.
 */

import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET() {
  try {
    const links = await storage.exportLinks();
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), links }, null, 2);

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="lynkhive-data.json"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
