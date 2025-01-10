'use client';

import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { Details, DetailsContent, DetailsSummary, SlashCommand, Table, TableCell, TableHeader, TableRow } from '@/components/tiptap/extensions';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Tables } from '@/type/database.types';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { useEditor, EditorContent } from '@tiptap/react';
import { useRef } from 'react';

import '@/styles/index.css';
import { TableColumnMenu, TableRowMenu } from '@/components/tiptap/extensions/Table/menus';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { Document } from '@/components/tiptap/extensions/Document';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';

export const TemplateDoc = ({ template }: { template?: Tables<'templates'> }) => {
	const menuContainerRef = useRef(null);

	const editor = useEditor({
		extensions: [
			Document,
			...ExtensionKit,
			SlashCommand,
			TableOfContents.configure({
				anchorTypes: ['heading', 'customAnchorType']
			}),
			Details.configure({
				persist: true,
				HTMLAttributes: {
					class: 'details'
				}
			}),
			DetailsContent,
			DetailsSummary,
			TableOfContentsNode,
			Table,
			TableCell,
			TableHeader,
			TableRow,
			Column,
			Columns,
			CustomMention.configure({ suggestion })
		],
		immediatelyRender: false,
		shouldRerenderOnTransaction: false,
		autofocus: true,
		content: '',
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				class: 'w-full min-h-[60vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
			}
		}
	});

	if (!editor) return null;

	(window as any).editor = editor;

	return (
		<section className="mx-auto max-w-5xl space-y-4">
			<div className="relative space-y-6">
				<div className="flex items-center justify-between">
					<div className="mx-8 flex items-center gap-1 text-sm font-light text-muted-foreground">
						<div>Documents</div>
						<div>/</div>
						<input className="w-full border-none text-base font-medium outline-none" placeholder="Enter template name" />
					</div>

					<Button variant={'ghost'}>
						<Settings2 size={14} />
					</Button>
				</div>

				<EditorContent editor={editor} className="no-scrollbar flex-1 overflow-y-auto" />
				<ContentItemMenu editor={editor} />
				<LinkMenu editor={editor} appendTo={menuContainerRef} />
				<TextMenuBubble editor={editor} />

				<ColumnsMenu editor={editor} appendTo={menuContainerRef} />
				<TableRowMenu editor={editor} appendTo={menuContainerRef} />
				<TableColumnMenu editor={editor} appendTo={menuContainerRef} />
			</div>
		</section>
	);
};
