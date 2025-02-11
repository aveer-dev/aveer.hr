import { Node, NodeProps, Handle, Position } from '@xyflow/react';
import { BaseNode } from './base-node';
import { Separator } from '@/components/ui/separator';

export type CustomNodeType = Node<{
	label: string;
	title?: string;
	manager?: string[];
}>;

export function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
	return (
		<BaseNode selected={selected} className="space-y-2">
			<div className="space-y-1">
				<h2 className="font-medium">{data.label}</h2>
				<p className="text-xs text-support">{data?.title}</p>
			</div>

			{!!data?.manager && data?.manager?.length > 0 && (
				<>
					<Separator orientation="horizontal" />

					<div className="space-y-1">
						{data?.manager?.map(manager => (
							<p key={manager} className="text-xs font-light text-support">
								Team manager: {manager}
							</p>
						))}
					</div>
				</>
			)}

			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />
		</BaseNode>
	);
}
