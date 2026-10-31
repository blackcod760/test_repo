"use client";

import { useFlowsStore } from "@/features/flows/store/flowsStore";

const buttonStyle = {
  padding: "6px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
} as const;

/** Toolbar: add nodes, save the flow, reload it from the backend. */
export function FlowToolbar() {
  const addNode = useFlowsStore((s) => s.addNode);
  const saveFlow = useFlowsStore((s) => s.saveFlow);
  const loadFlow = useFlowsStore((s) => s.loadFlow);
  const flow = useFlowsStore((s) => s.flow);
  const saving = useFlowsStore((s) => s.saving);
  const dirty = useFlowsStore((s) => s.dirty);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, borderBottom: "1px solid #e2e8f0" }}>
      <button type="button" style={buttonStyle} onClick={() => addNode("textNode", { x: 250, y: 100 })}>
        + Text node
      </button>
      <button
        type="button"
        style={{ ...buttonStyle, opacity: saving ? 0.5 : 1 }}
        disabled={saving || !flow}
        onClick={() => saveFlow()}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        style={{ ...buttonStyle, opacity: flow ? 1 : 0.5 }}
        disabled={!flow}
        onClick={() => flow && loadFlow(flow.id)}
      >
        Reload
      </button>
      {dirty && <span style={{ fontSize: 12, color: "#b45309" }}>Unsaved changes</span>}
    </div>
  );
}
