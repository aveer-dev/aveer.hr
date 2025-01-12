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
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, EyeOff, Info, LockKeyhole, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { DocumentOptions } from './document-options';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loader';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const Document = ({ doc, adminUsers, currentUserId }: { doc?: Tables<'documents'>; adminUsers?: Tables<'profiles_roles'>[] | null; currentUserId: string }) => {
	const router = useRouter();
	const menuContainerRef = useRef(null);
	const [name, updateName] = useState(doc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [documentHTML, setDocumentHTML] = useState<string>('');
	const [document] = useDebounce(documentHTML, 1000);
	const [isTemplate, setTemplateState] = useState(!!doc?.template);
	const [isSaving, setSavingState] = useState(false);
	const [isSaved, setSavedState] = useState(false);

	useEffect(() => {
		const onUpdateDocument = async () => {
			setSavingState(true);
			setSavedState(false);
			const { error } = await updateDocument({ name: documentName, id: doc?.id, org: doc?.org, html: document, template: isTemplate });
			setSavingState(false);

			if (error) {
				setSavedState(false);
				return toast.error(error.message);
			}

			setSavedState(true);
		};

		onUpdateDocument();
	}, [doc?.id, doc?.org, documentName, document, isTemplate]);

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
		content: doc?.html ? doc?.html : '',
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				class: 'w-full min-h-[60vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
			}
		},
		onUpdate(props) {
			setDocumentHTML(props.editor.getHTML());
		},
		editable: !doc?.locked
	});

	useEffect(() => {
		if (editor) editor.setEditable(!doc?.locked);
	}, [doc?.locked, editor]);

	if (!editor) return null;

	return (
		<section className="mx-auto max-w-5xl space-y-4">
			<div className="relative space-y-6">
				<div className="mx-8 mb-8 flex items-center justify-between border-b pb-8">
					<div className="flex w-full items-center gap-3 text-sm font-light text-muted-foreground">
						<Link href={'../documents'} className={cn(buttonVariants({ variant: 'secondary' }), 'rounded-full')} onClick={() => router.back()}>
							<ChevronLeft size={14} />
						</Link>

						<Input value={name} onChange={event => updateName(event.target.value)} className="w-full max-w-96 px-0.5 py-2 pl-2 text-sm font-medium text-primary outline-none" placeholder="Enter document's name" />

						<div className="-ml-2 flex items-center">
							{doc?.locked && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant={'ghost'}>
												<LockKeyhole size={14} />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-40">{isTemplate ? 'Template' : 'Document'} is locked and cannot be edited by anyone.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}

							{doc?.private && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant={'ghost'}>
												<EyeOff size={14} />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-40">{isTemplate ? 'Template' : 'Document'} is private, only visible to allowed editors.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}

							{isSaving && (
								<span className="flex items-center gap-1 font-light text-muted-foreground">
									<LoadingSpinner className="w-3" /> saving...
								</span>
							)}

							{isSaved && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant={'ghost'}>
												<Save size={14} />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-40">{isTemplate ? 'Template' : 'Document'} is saved to cloud.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					</div>

					{doc && (
						<div className="flex items-center gap-3">
							<div className="flex items-center space-x-2">
								<Label htmlFor="template" className="flex items-center gap-1 text-sm">
									Template
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Info size={12} />
											</TooltipTrigger>
											<TooltipContent>
												<p className="max-w-40">Make this document a template for contracts, e.t.c.</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</Label>
								<Switch checked={isTemplate} disabled={isSaving} id="template" className="scale-75" onCheckedChange={setTemplateState} />
							</div>
							<Separator orientation="vertical" className="h-4" />
							<DocumentSettingsDialog isPrivate={doc.private} currentUserId={currentUserId} owner={doc.owner} adminUsers={adminUsers} editors={doc?.editors} org={doc?.org} docId={doc?.id} />
							<Separator orientation="vertical" className="h-4" />
							<DocumentOptions document={{ ...doc, html: editor.getHTML() }} currentUserId={currentUserId} />
						</div>
					)}
				</div>

				<EditorContent editor={editor} className="flex-1 overflow-y-auto" />
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
