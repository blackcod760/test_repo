"use client";

import { useFlowsStore } from "@/features/flows/store/flowsStore";
import { TextNodeEditor } from "@/features/textNode/TextNodeEditor";

/**
 * Side panel showing the editor for the selected node.
 * Dispatches on node type via the editors registry — only the vertical-slice
 * textNode is implemented; other node types are future spec work.
 */
export function NodeEditorPanel() {
  const flow = useFlowsStore((s) => s.flow);
  const selectedNodeId = useFlowsStore((s) => s.selectedNodeId);
  const updateNodeData = useFlowsStore((s) => s.updateNodeData);
  const removeNode = useFlowsStore((s) => s.removeNode);

  const node = flow?.nodes.find((n) => n.id === selectedNodeId) ?? null;

  if (!node) {
    return (
      <div style={{ padding: 16, color: "#64748b", fontSize: 14 }}>
        Select a node to edit it, or add one from the toolbar.
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>Edit node</h2>
      {node.type === "textNode" ? (
        <TextNodeEditor data={node.data} onChange={(patch) => updateNodeData(node.id, patch)} />
      ) : (
        <div style={{ color: "#94a3b8", fontSize: 14 }}>No editor for node type “{node.type}”.</div>
      )}
      <button
        type="button"
        onClick={() => removeNode(node.id)}
        style={{
          alignSelf: "flex-start",
          padding: "6px 12px",
          border: "1px solid #dc2626",
          color: "#dc2626",
          background: "#fff",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Delete node
      </button>
    </div>
  );
}
