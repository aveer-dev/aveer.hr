'use client';

import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { Details, DetailsContent, DetailsSummary, SlashCommand, Table, TableCell, TableHeader, TableRow } from '@/components/tiptap/extensions';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Tables } from '@/type/database.types';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

import '@/styles/index.css';
import { TableColumnMenu, TableRowMenu } from '@/components/tiptap/extensions/Table/menus';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { DocumentSettingsDialog } from './document-settings-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { DocumentOptions } from './document-options';
import { Separator } from '@/components/ui/separator';

export const Document = ({ doc, adminUsers, currentUserId }: { doc?: Tables<'documents'>; adminUsers?: Tables<'profiles_roles'>[] | null; currentUserId: string }) => {
	const router = useRouter();
	const menuContainerRef = useRef(null);
	const [name, updateName] = useState(doc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [documentJson, setDocumentJson] = useState<JSONContent>({});
	const [document] = useDebounce(documentJson, 1000);

	useEffect(() => {
		const onUpdateDocument = async () => {
			const { error } = await updateDocument({ name: documentName, id: doc?.id, org: doc?.org, json: JSON.stringify(document) });
			if (error) return toast.error(error.message);
		};

		onUpdateDocument();
	}, [doc?.id, doc?.org, documentName, document]);

	const editor = useEditor({
		extensions: [
			TiptapDocument,
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
		content: doc?.json ? JSON.parse(doc?.json) : '',
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				class: 'w-full min-h-[60vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
			}
		},
		onUpdate(props) {
			setDocumentJson(props.editor.getJSON());
		},
		editable: !doc?.locked
	});

	useEffect(() => {
		if (editor) {
			editor.setEditable(!doc?.locked);
		}
	}, [doc?.locked, editor]);

	if (!editor) return null;

	(window as any).editor = editor;

	return (
		<section className="mx-auto max-w-5xl space-y-4">
			<div className="relative space-y-6">
				<div className="mx-8 flex items-center justify-between border-b pb-4">
					<div className="flex w-full items-center gap-1 text-sm font-light text-muted-foreground">
						<Button className="mr-2 rounded-full" variant={'secondary'} onClick={() => router.back()}>
							<ChevronLeft size={14} />
						</Button>

						<div>Documents</div>
						<div>/</div>

						{doc?.locked && <LockKeyhole size={12} />}
						<input value={name} onChange={event => updateName(event.target.value)} className="w-full max-w-96 rounded-md border-none bg-accent px-0.5 py-1 text-sm font-medium text-primary outline-none" placeholder="Enter template name" />
					</div>

					{doc && (
						<div className="flex items-center gap-3">
							<DocumentOptions document={{ ...doc, json: JSON.stringify(editor.getJSON()) }} currentUserId={currentUserId} />
							<Separator orientation="vertical" className="h-4" />
							<DocumentSettingsDialog currentUserId={currentUserId} owner={doc.owner} adminUsers={adminUsers} editors={doc?.editors} org={doc?.org} docId={doc?.id} />
						</div>
					)}
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
