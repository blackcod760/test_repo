import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFlowsStore, resetIdCounter } from "@/features/flows/store/flowsStore";
import type { Flow } from "@/shared/types";

function mockFetchOnce(flow: Flow) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(flow), { status: 200, headers: { "Content-Type": "application/json" } })),
  );
}

beforeEach(() => {
  resetIdCounter();
  useFlowsStore.setState({ flow: null, selectedNodeId: null, dirty: false, saving: false, loading: false, error: null });
  vi.unstubAllGlobals();
});

describe("vertical-slice textNode end-to-end (store level)", () => {
  it("adds a node", () => {
    const id = useFlowsStore.getState().addNode("textNode", { x: 10, y: 20 });
    const { flow, selectedNodeId } = useFlowsStore.getState();
    expect(flow?.nodes).toHaveLength(1);
    expect(flow?.nodes[0]).toMatchObject({ id, type: "textNode", position: { x: 10, y: 20 } });
    expect(selectedNodeId).toBe(id);
  });

  it("edits a node", () => {
    const id = useFlowsStore.getState().addNode("textNode", { x: 0, y: 0 });
    useFlowsStore.getState().updateNodeData(id, { label: "Welcome", text: "Hello there" });
    const node = useFlowsStore.getState().flow?.nodes[0];
    expect(node?.data).toMatchObject({ label: "Welcome", text: "Hello there" });
    expect(useFlowsStore.getState().dirty).toBe(true);
  });

  it("connects two nodes", () => {
    const a = useFlowsStore.getState().addNode("textNode", { x: 0, y: 0 });
    const b = useFlowsStore.getState().addNode("textNode", { x: 0, y: 100 });
    useFlowsStore.getState().onConnect({ source: a, target: b, sourceHandle: null, targetHandle: null });
    const edges = useFlowsStore.getState().flow?.edges ?? [];
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ source: a, target: b });
  });

  it("saves and loads a flow through the SDK adapter", async () => {
    const id = useFlowsStore.getState().addNode("textNode", { x: 5, y: 5 });
    useFlowsStore.getState().updateNodeData(id, { text: "saved message" });

    const current = useFlowsStore.getState().flow!;
    mockFetchOnce(current);

    await useFlowsStore.getState().saveFlow();
    const afterSave = useFlowsStore.getState();
    expect(afterSave.dirty).toBe(false);
    expect(afterSave.flow?.nodes[0].data.text).toBe("saved message");

    useFlowsStore.setState({ flow: null, dirty: false });
    mockFetchOnce(current);
    await useFlowsStore.getState().loadFlow(current.id);
    const afterLoad = useFlowsStore.getState();
    expect(afterLoad.flow?.id).toBe(current.id);
    expect(afterLoad.flow?.nodes[0].data.text).toBe("saved message");
  });
});
