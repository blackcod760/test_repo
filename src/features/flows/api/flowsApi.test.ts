import { describe, it, expect, vi, beforeEach } from "vitest";
import { flowsApi } from "@/features/flows/api/flowsApi";
import type { Flow } from "@/shared/types";

const flow: Flow = { id: "f1", name: "n", nodes: [], edges: [] };

beforeEach(() => vi.unstubAllGlobals());

describe("flowsApi SDK adapter", () => {
  it("getFlow calls the route handler, not the backend directly", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(flow), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await flowsApi.getFlow("f1");
    expect(fetchMock).toHaveBeenCalledWith("/api/flows/f1", expect.anything());
  });

  it("saveFlow PUTs to the route handler", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(flow), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await flowsApi.saveFlow(flow);
    expect(fetchMock).toHaveBeenCalledWith("/api/flows/f1", expect.objectContaining({ method: "PUT" }));
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    await expect(flowsApi.getFlow("f1")).rejects.toThrow();
  });
});
