import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { NodeData } from "@/shared/types";

export type TextFlowNode = Node<NodeData, "textNode">;

/** React Flow node body for the vertical-slice node type. */
function TextNodeComponent({ data, selected }: NodeProps<TextFlowNode>) {
  return (
    <div
      style={{
        border: `2px solid ${selected ? "#2563eb" : "#94a3b8"}`,
        borderRadius: 8,
        padding: "8px 12px",
        background: "#fff",
        minWidth: 160,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, fontSize: 12, color: "#475569" }}>{data.label}</div>
      <div style={{ fontSize: 14, whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
        {data.text || <span style={{ color: "#94a3b8" }}>Empty message…</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const TextNode = memo(TextNodeComponent);
