"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "@/features/flows/components/nodeTypes";
import { useFlowsStore } from "@/features/flows/store/flowsStore";

/** React Flow canvas bound to the flows store. */
export function FlowCanvas() {
  const flow = useFlowsStore((s) => s.flow);
  const onNodesChange = useFlowsStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowsStore((s) => s.onEdgesChange);
  const onConnect = useFlowsStore((s) => s.onConnect);
  const selectNode = useFlowsStore((s) => s.selectNode);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => onNodesChange(changes),
    [onNodesChange],
  );
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => onEdgesChange(changes),
    [onEdgesChange],
  );
  const handleConnect = useCallback(
    (connection: Connection) => onConnect(connection),
    [onConnect],
  );

  return (
    <div style={{ width: "100%", height: "100%" }} data-testid="flow-canvas">
      <ReactFlow
        nodes={(flow?.nodes ?? []) as Node[]}
        edges={(flow?.edges ?? []) as Edge[]}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
