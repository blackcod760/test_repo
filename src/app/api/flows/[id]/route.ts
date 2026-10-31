import { NextRequest } from "next/server";
import { proxyJson } from "@/server/bbot";

/**
 * GET  /api/flows/[id] — fetch one flow from the bbot backend.
 * PUT  /api/flows/[id] — save a flow to the bbot backend.
 */

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyJson(`/flows/${encodeURIComponent(id)}`);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.text();
  return proxyJson(`/flows/${encodeURIComponent(id)}`, { method: "PUT", body });
}
