"use client";

import type { NodeEditorProps } from "@/features/textNode/types";

/** Editor panel body for the vertical-slice node type: label + message text. */
export function TextNodeEditor({ data, onChange }: NodeEditorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        Label
        <input
          value={data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        Message text
        <textarea
          value={data.text}
          rows={5}
          onChange={(e) => onChange({ text: e.target.value })}
          style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, resize: "vertical" }}
        />
      </label>
    </div>
  );
}
