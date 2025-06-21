'use client';

import { Editor as CoreEditor } from '@tiptap/core';
import { memo } from 'react';
import { TableOfContentsStorage } from '@tiptap/extension-table-of-contents';
import { cn } from '@/lib/utils';
import { useEditorState } from '@tiptap/react';

export type TableOfContentsProps = {
	editor: CoreEditor;
	onItemClick?: () => void;
};

export const TableOfContents = memo(({ editor }: TableOfContentsProps) => {
	const content = useEditorState({
		editor,
		selector: ctx => (ctx.editor.storage.tableOfContents as TableOfContentsStorage).content
	});

	return (
		<>
			<div className="mb-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Table of contents</div>
			{content.length > 0 ? (
				<div className="flex flex-col gap-1">
					{content.map(item => (
						<a
							key={item.id}
							href={`#${item.id}`}
							style={{ marginLeft: `${0.8 * item.level - 1}rem` }}
							className={cn(
								'block w-full truncate rounded bg-opacity-10 p-1 text-sm font-medium text-neutral-500 transition-all hover:bg-black hover:bg-opacity-5 hover:text-neutral-800 dark:text-neutral-300',
								item.isActive && 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100'
							)}>
							{item.textContent}
						</a>
					))}
				</div>
			) : (
				<div className="text-sm text-muted-foreground">Docuement headings will show here...</div>
			)}
		</>
	);
});

TableOfContents.displayName = 'TableOfContents';
