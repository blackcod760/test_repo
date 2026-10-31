export type NodeType = "textNode";

export interface Position {
  x: number;
  y: number;
}

export type NodeData = {
  label: string;
  text: string;
  [key: string]: unknown;
};

export interface FlowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
