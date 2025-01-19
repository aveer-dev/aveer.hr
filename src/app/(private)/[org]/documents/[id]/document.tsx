'use client';

import '@/styles/index.css';

import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { Details, DetailsContent, DetailsSummary, SignatureFigure, SlashCommand, Table, TableCell, TableHeader, TableRow } from '@/components/tiptap/extensions';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Tables } from '@/type/database.types';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { TableColumnMenu, TableRowMenu } from '@/components/tiptap/extensions/Table/menus';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { DocumentSettingsDialog } from './document-settings-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, EyeOff, Info, LockKeyhole, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { DocumentOptions } from './document-options';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loader';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AddSignatoryDialog } from './add-signatory-dialog';
import { SendToSignatories } from './send-to-sign-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export const Document = ({ doc, adminUsers, currentUserId, employees }: { doc?: Tables<'documents'>; adminUsers?: Tables<'profiles_roles'>[] | null; currentUserId: string; employees?: Tables<'contracts'>[] | null }) => {
	const router = useRouter();
	const menuContainerRef = useRef(null);
	const [name, updateName] = useState(doc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [documentHTML, setDocumentHTML] = useState<string>('');
	const [document] = useDebounce(documentHTML, 1000);
	const [isSaving, setSavingState] = useState(false);
	const [isSaved, setSavedState] = useState(false);
	const [signatories, updateSignatories] = useState<{ id: string; contract?: number; toc: string }[]>((doc?.signatures as any) || []);

	useEffect(() => {
		const onUpdateDocument = async () => {
			setSavingState(true);
			setSavedState(false);
			const { error } = await updateDocument({ name: documentName, id: doc?.id, org: doc?.org, html: document, signatures: signatories });
			setSavingState(false);

			if (error) {
				setSavedState(false);
				return toast.error(error.message);
			}

			setSavedState(true);
		};

		onUpdateDocument();
	}, [doc?.id, doc?.org, documentName, document, signatories]);

	const updateSinatories = (editor: Editor) => {
		const { content } = editor.state.doc.content;
		const signatures = content.filter(node => node.type.name === 'signatureFigure');

		// Create a map of existing signatories for efficient lookup
		const existingSignatoriesMap = new Map(signatories.map(signatory => [signatory.id, signatory]));

		// Build updated signatories array
		const updatedSignatories = signatures.map(signature => {
			const id = signature.attrs['data-id'];
			const existingSignatory = existingSignatoriesMap.get(id);

			// If signatory exists, preserve its data, otherwise create new entry
			return (
				existingSignatory || {
					id,
					toc: signature.attrs['data-toc-id']
				}
			);
		});

		// Update state only if there are changes
		if (JSON.stringify(signatories) !== JSON.stringify(updatedSignatories)) {
			updateSignatories(updatedSignatories);
		}
	};

	const editor = useEditor({
		extensions: [
			TiptapDocument,
			SignatureFigure,
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
		onUpdate({ editor }) {
			setDocumentHTML(editor.getHTML());
			updateSinatories(editor);
		},
		editable: !doc?.locked
	});

	useEffect(() => {
		if (editor) editor.setEditable(!doc?.locked);
	}, [doc?.locked, editor]);

	if (!editor) return null;

	const getEmployeeName = (employeeId?: number) => {
		const profile = employees?.find(employee => employee.id == employeeId)?.profile;
		return `${(profile as any).first_name} ${(profile as any).last_name}`;
	};

	return (
		<section className="relative mx-auto max-w-5xl space-y-4">
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
											<p className="max-w-40">Document is locked and cannot be edited by anyone.</p>
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
											<p className="max-w-40">Document is private, only visible to allowed editors.</p>
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
											<p className="max-w-40">Document is saved to cloud.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					</div>

					{doc && (
						<div className="flex items-center gap-3">
							{/* <SendToSignatories />
							<Separator orientation="vertical" className="h-4" /> */}
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

			{!!signatories.length && (
				<div className="fixed right-4 top-56 w-full max-w-[14rem] space-y-5 text-right">
					<h2 className="font-semibold">Signatures</h2>

					<ul className="space-y-6 text-sm font-light">
						{signatories.map((signature, index) => (
							<li key={signature.id} className="block w-full space-y-1 p-1 transition-all duration-500">
								<div>
									<p>{!signature.contract ? 'No signatory added' : getEmployeeName(signature.contract)}</p>
									<p className="ml-auto max-w-36 truncate text-xs text-muted-foreground">{signature.id}</p>
								</div>

								<div className="flex items-center justify-end gap-4">
									<Link href={`#${signature.toc}`} className="flex items-center gap-2 text-sm underline decoration-dashed">
										Open
									</Link>

									<AddSignatoryDialog
										onAddSignatory={data => {
											signatories[index] = { ...signatories[index], ...data };
											updateSignatories([...signatories]);
										}}
										signatory={{ id: signature.id, contract: signature.contract }}
										employees={employees}
									/>
								</div>
							</li>
						))}
					</ul>

					<div className="flex items-center justify-end gap-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<a>
										<Info size={14} />
									</a>
								</TooltipTrigger>

								<TooltipContent>
									<p className="w-44 text-left">Send will lock this document and send a signature request to signatories.</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<div className="flex items-center rounded-md bg-primary">
							<Button className="px-6">Send</Button>

							<Separator orientation="vertical" className="h-4" />

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button>
										<ChevronDown size={12} />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end" className="w-44">
									<DropdownMenuGroup>
										<DropdownMenuItem>Duplicate and Send</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
							{/* <Button variant={'outline'}>Duplicate and Send</Button> */}
						</div>
					</div>
				</div>
			)}
		</section>
	);
};
