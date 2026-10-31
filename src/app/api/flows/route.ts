import { NextRequest } from "next/server";
import { proxyJson } from "@/server/bbot";

/**
 * GET  /api/flows — list flows from the bbot backend.
 * POST /api/flows — create a flow.
 */

export async function GET() {
  return proxyJson("/flows");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyJson("/flows", { method: "POST", body });
}
