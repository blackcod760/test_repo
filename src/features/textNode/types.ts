import type { NodeData } from "@/shared/types";

/** Props every node type editor receives from the generic panel. */
export interface NodeEditorProps {
  data: NodeData;
  onChange: (patch: Partial<NodeData>) => void;
}
