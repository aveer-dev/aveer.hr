import { Node, NodeProps, Handle, Position } from '@xyflow/react';
import { BaseNode } from '@/app/(private)/[org]/org-chart/flow-diagram/base-node';
import { Separator } from '@/components/ui/separator';

export type CustomNodeType = Node<{
	label: string;
	title?: string;
	manager?: string;
}>;

export function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
	return (
		<BaseNode selected={selected} className="space-y-1">
			<h2 className="font-medium">{data.label}</h2>
			<p className="text-xs text-support">{data?.title}</p>

			{data?.manager && (
				<>
					<Separator orientation="horizontal" />

					<p className="text-xs font-light text-support">Team manager: {data?.manager}</p>
				</>
			)}

			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />
		</BaseNode>
	);
}
