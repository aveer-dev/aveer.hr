import { cn } from '@/lib/utils';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useEffect } from 'react';

export function MentionComponent(props: NodeViewProps) {
	useEffect(() => {
		return () => {
			console.log(`Mention ${props.node.attrs.label} deleted`);
		};
	}, [props.node.attrs.label]);

	return (
		<NodeViewWrapper className="mx-1 inline w-fit">
			<span className={cn('rounded-md bg-accent p-1 text-sm')}>@{props.node.attrs.label}</span>
		</NodeViewWrapper>
	);
}
