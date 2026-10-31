import { create } from "zustand";
import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { Flow, FlowEdge, FlowNode, NodeData, NodeType } from "@/shared/types";
import { flowsApi } from "@/features/flows/api/flowsApi";

export interface FlowsState {
  flow: Flow | null;
  selectedNodeId: string | null;
  dirty: boolean;
  saving: boolean;
  loading: boolean;
  error: string | null;

  loadFlow: (id: string) => Promise<void>;
  saveFlow: () => Promise<void>;
  addNode: (type: NodeType, position: { x: number; y: number }) => string;
  updateNodeData: (id: string, patch: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string | null) => void;
}

const defaultNodeData: NodeData = { label: "Text message", text: "" };

let nextId = 1;
export function resetIdCounter(): void {
  nextId = 1;
}
function genId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

export const useFlowsStore = create<FlowsState>((set, get) => ({
  flow: null,
  selectedNodeId: null,
  dirty: false,
  saving: false,
  loading: false,
  error: null,

  loadFlow: async (id) => {
    set({ loading: true, error: null });
    try {
      const flow = await flowsApi.getFlow(id);
      set({ flow, loading: false, dirty: false, selectedNodeId: null });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Failed to load flow" });
    }
  },

  saveFlow: async () => {
    const { flow } = get();
    if (!flow) return;
    set({ saving: true, error: null });
    try {
      const saved = await flowsApi.saveFlow(flow);
      set({ flow: saved, saving: false, dirty: false });
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Failed to save flow" });
    }
  },

  addNode: (type, position) => {
    const id = genId(type);
    const node: FlowNode = { id, type, position, data: { ...defaultNodeData } };
    set((s) => ({
      flow: s.flow ? { ...s.flow, nodes: [...s.flow.nodes, node] } : { id: genId("flow"), name: "Untitled flow", nodes: [node], edges: [] },
      dirty: true,
      selectedNodeId: id,
    }));
    return id;
  },

  updateNodeData: (id, patch) => {
    set((s) => ({
      flow: s.flow && {
        ...s.flow,
        nodes: s.flow.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      },
      dirty: true,
    }));
  },

  removeNode: (id) => {
    set((s) => ({
      flow: s.flow && {
        ...s.flow,
        nodes: s.flow.nodes.filter((n) => n.id !== id),
        edges: s.flow.edges.filter((e) => e.source !== id && e.target !== id),
      },
      dirty: true,
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  onNodesChange: (changes) => {
    set((s) => {
      if (!s.flow) return s;
      let nodes = s.flow.nodes;
      let removed = false;
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          nodes = nodes.map((n) => (n.id === change.id ? { ...n, position: change.position! } : n));
        } else if (change.type === "remove") {
          nodes = nodes.filter((n) => n.id !== change.id);
          removed = true;
        }
      }
      return {
        flow: {
          ...s.flow,
          nodes,
          edges: removed ? s.flow.edges.filter((e) => nodes.some((n) => n.id === e.source) && nodes.some((n) => n.id === e.target)) : s.flow.edges,
        },
        dirty: true,
      };
    });
  },

  onEdgesChange: (changes) => {
    set((s) => {
      if (!s.flow) return s;
      let edges = s.flow.edges;
      for (const change of changes) {
        if (change.type === "remove") edges = edges.filter((e) => e.id !== change.id);
      }
      return { flow: { ...s.flow, edges }, dirty: true };
    });
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;
    const id = `e-${connection.source}-${connection.target}`;
    set((s) => {
      if (!s.flow) return s;
      if (s.flow.edges.some((e) => e.id === id)) return s;
      const edge: FlowEdge = { id, source: connection.source, target: connection.target };
      return { flow: { ...s.flow, edges: [...s.flow.edges, edge] }, dirty: true };
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),
}));
