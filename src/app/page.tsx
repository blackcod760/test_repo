"use client";

import dynamic from "next/dynamic";
import { FlowToolbar } from "@/features/flows/components/FlowToolbar";
import { NodeEditorPanel } from "@/features/flows/components/NodeEditorPanel";

// React Flow needs the browser; skip SSR for the canvas.
const FlowCanvas = dynamic(
  () => import("@/features/flows/components/FlowCanvas").then((m) => m.FlowCanvas),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#64748b" }}>
        Loading canvas…
      </div>
    ),
  },
);

/** Editor page: toolbar + canvas + node editor side panel. */
export default function FlowEditorPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <FlowToolbar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <main style={{ flex: 1, minWidth: 0 }}>
          <FlowCanvas />
        </main>
        <aside style={{ width: 300, borderLeft: "1px solid #e2e8f0", overflowY: "auto", background: "#f8fafc" }}>
          <NodeEditorPanel />
        </aside>
      </div>
    </div>
  );
}
