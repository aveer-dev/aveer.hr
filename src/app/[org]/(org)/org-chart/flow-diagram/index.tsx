'use client';

import { CustomNode } from '@/app/(private)/[org]/org-chart/flow-diagram/custom-node';
import { Background, Controls, ReactFlow, Node, Edge } from '@xyflow/react';

const nodeTypes = {
	custom: CustomNode
};

export default function FlowDiagram({ defaultNodes, edges }: { defaultNodes: Node[]; edges: Edge[] }) {
	return (
		<div className="h-full w-full">
			<ReactFlow proOptions={{ hideAttribution: true }} nodeTypes={nodeTypes} defaultNodes={defaultNodes} defaultEdges={edges} fitView>
				<Background color="#000" size={1.1} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
