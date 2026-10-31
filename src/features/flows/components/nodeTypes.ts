import type { NodeProps, Node } from "@xyflow/react";
import type { NodeData } from "@/shared/types";
import { TextNode, type TextFlowNode } from "@/features/textNode/TextNode";

/** Registry mapping node type names to their canvas components. */
export const nodeTypes = {
  textNode: TextNode,
};

export type FlowNodeUnion = TextFlowNode;
export type AnyFlowNode = Node<NodeData, keyof typeof nodeTypes>;
export type AnyNodeProps = NodeProps<AnyFlowNode>;
