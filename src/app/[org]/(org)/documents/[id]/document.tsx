'use client';

import '@/styles/index.css';

import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { Details, DetailsContent, DetailsSummary, SignatureFigure, SignatureImage, SlashCommand, Table, TableCell, TableHeader, TableRow, UniqueID } from '@/components/tiptap/extensions';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Tables } from '@/type/database.types';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TableColumnMenu, TableRowMenu } from '@/components/tiptap/extensions/Table/menus';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { DocumentSettingsDialog } from './document-settings-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, Globe, Info, LockKeyhole, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { sendToSignatories, updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { DocumentOptions } from './document-options';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loader';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AddSignatoryDialog } from './add-signatory-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentDupForSignature } from './document-dup-signature-dialog';

interface PROPS {
	doc: Tables<'documents'>;
	currentUserId?: string;
	employees?: Tables<'contracts'>[] | null;
	parentContainerId?: string;
}

export const Document = ({ doc, currentUserId, employees, parentContainerId }: PROPS) => {
	const router = useRouter();
	const menuContainerRef = useRef(null);
	const [name, updateName] = useState(doc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [documentHTML, setDocumentHTML] = useState<string>('');
	const [docHTML] = useDebounce(documentHTML, 1000);
	const [isSaving, setSavingState] = useState(false);
	const [isSending, setSendingState] = useState(false);
	const [isSaved, setSavedState] = useState(false);
	const [signatories, updateSignatories] = useState<{ id: string; contract?: number; profile?: string }[]>((doc?.signatures as any) || []);

	useEffect(() => {
		const onUpdateDocument = async () => {
			if (!currentUserId || doc.locked) return;

			if (!doc.locked && !doc.signed_lock) {
				setSavingState(true);
				setSavedState(false);
			}

			const { error, data } = await updateDocument({ name: documentName, id: doc?.id, org: (doc?.org as any).subdomain, html: docHTML });
			setSavingState(false);
			if (error) {
				setSavedState(false);
				return toast.error(error.message);
			}

			// eslint-disable-next-line react-hooks/exhaustive-deps
			if (data) doc = data;
			if (!doc.locked && !doc.signed_lock) setSavedState(true);
		};

		if (docHTML) onUpdateDocument();
	}, [doc?.id, doc?.org, documentName, docHTML]);

	const onUpdateSignatures = (editor: Editor) => {
		const { content } = editor.state.doc.content;
		const signatures = content.filter(node => node.type.name === 'signatureFigure' || node.type.name === 'signatureUpload' || node.type.name === 'signatureImage');

		// Create a map of existing signatories for efficient lookup
		const existingSignatoriesMap = new Map(signatories.map(signatory => [signatory.id, signatory]));

		// Build updated signatories array
		const updatedSignatories = signatures.map(signature => {
			const id = signature.attrs['id'];
			const existingSignatory = existingSignatoriesMap.get(id);

			// If signatory exists, preserve its data, otherwise create new entry
			return (
				existingSignatory || {
					id
				}
			);
		});

		updateSignatories(updatedSignatories);
	};

	const getEmployee = (employeeId?: number) => {
		const employee = employeeId ? employees?.find(employee => employee.id == employeeId) : employees?.find(employee => (employee.profile as any).id == currentUserId);
		return employee as Tables<'contracts'>;
	};

	const editor = useEditor({
		extensions: [
			TiptapDocument,
			SignatureFigure.configure({ profile: getEmployee()?.profile, uploadPath: `${getEmployee()?.org}/${getEmployee()?.id}`, onSignDocuemnt: updateDocument, document: doc, signatories }),
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
			UniqueID.configure({
				attributeName: 'id',
				types: ['paragraph', 'signatureFigure', 'heading', 'blockquote', 'codeBlock', 'table', 'signatureUpload']
			}),
			SignatureImage,
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
				class: 'w-full min-h-[80vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
			}
		},
		onUpdate({ editor }) {
			onUpdateSignatures(editor);
			if (doc.locked || doc.signed_lock) return;

			setDocumentHTML(editor.getHTML());
		},
		editable: !doc?.locked
	});

	const userPermittedAction = useCallback(() => {
		if (currentUserId == doc.owner) return 'owner';
		const userAccess = (doc.shared_with as unknown as { contract: number; profile: string; access: 'editor' | 'viewer' | 'owner' }[]).find(person => person.profile == currentUserId);
		return userAccess?.access;
	}, [currentUserId, doc.owner, doc.shared_with]);

	useEffect(() => {
		if (editor) editor.setEditable(!doc?.locked && !doc.signed_lock && (userPermittedAction() == 'editor' || userPermittedAction() == 'owner'));
	}, [doc?.locked, doc.signed_lock, editor, userPermittedAction]);

	if (!editor) return null;

	const onSendToSignatories = async () => {
		if (!!signatories.find(signatory => !signatory.contract)) return toast.error('Set signatories for each signature');

		setSendingState(true);
		try {
			await sendToSignatories({ org: (doc?.org as any).subdomain, orgName: '', id: doc?.id!, name: doc?.name!, signatures: signatories, emails: signatories.map(signatory => (employees?.find(employee => employee.id == signatory.contract)?.profile as any).email) });
			toast.success('Document signature request sent to signatories');
			setSendingState(false);
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || error);
			setSendingState(false);
		}
	};

	return (
		<section className="relative mx-auto max-w-5xl space-y-4">
			<div className="relative space-y-6">
				<div className="mx-8 mb-8 flex items-center justify-between border-b pb-6">
					<div className="flex w-full items-center gap-3 text-sm font-light text-muted-foreground">
						{currentUserId && (
							<Link href={'../documents'} className={cn(buttonVariants({ variant: 'secondary' }), 'rounded-full')} onClick={() => router.back()}>
								<ChevronLeft size={14} />
							</Link>
						)}

						{currentUserId && (
							<Input
								value={name}
								readOnly={doc.locked || doc.signed_lock || userPermittedAction() == 'viewer'}
								onChange={event => updateName(event.target.value)}
								className={cn('w-full px-0.5 py-2 pl-2 text-sm font-medium text-primary outline-none')}
								placeholder="Enter document's name"
							/>
						)}
						{!currentUserId && <h1 className={cn('w-full px-0.5 py-2 pl-2 text-2xl font-bold text-primary')}>{name}</h1>}
					</div>

					{doc && (!doc.locked || !doc.signed_lock || userPermittedAction() !== 'viewer') && currentUserId && (
						<div className="flex items-center gap-3">
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
											<Button variant={'ghost'}>{!doc.private && <Globe size={14} />}</Button>
										</TooltipTrigger>

										<TooltipContent>
											<p className="max-w-40">Document is visible to anyone on the internet with document link.</p>
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

							<DocumentSettingsDialog employees={employees} doc={{ ...doc, name }} currentUserId={currentUserId} />
							<DocumentOptions document={{ ...doc, html: editor.getHTML() }} currentUserId={currentUserId} />
						</div>
					)}
				</div>

				<EditorContent editor={editor} className="flex-1 overflow-y-auto" />
				<ContentItemMenu editor={editor} disabled={doc.locked || doc.signed_lock || !userPermittedAction() || userPermittedAction() == 'viewer'} />
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
							<li key={signature.id + 'signatures'} className="block w-full space-y-1 p-1 transition-all duration-500">
								<div>
									<p>{!signature.contract ? 'No signatory added' : `${(getEmployee(signature.contract)?.profile as any)?.first_name} ${(getEmployee(signature.contract)?.profile as any)?.last_name}`}</p>
									<p className="ml-auto max-w-36 truncate text-xs text-muted-foreground">{signature.id}</p>
								</div>

								<div className="flex items-center justify-end gap-4">
									<button
										className="flex items-center gap-2 text-sm underline decoration-dashed"
										onClick={() => {
											const signatureElement = document.querySelector(`[data-id='${signature.id}']`) as HTMLElement;
											(parentContainerId ? document.querySelector(`#${parentContainerId}`) : window)?.scrollTo({ top: signatureElement.offsetTop, behavior: 'smooth' });
											signatureElement.classList.add('sks');
										}}>
										Go to
									</button>

									{!doc.signed_lock && (
										<AddSignatoryDialog
											onAddSignatory={data => {
												signatories[index] = { ...signatories[index], ...data };
												updateSignatories([...signatories]);
											}}
											signatory={{ id: signature.id, contract: signature.contract }}
											employees={employees}
										/>
									)}
								</div>
							</li>
						))}
					</ul>

					{!doc.signed_lock && (
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
								<Button className="px-6 disabled:opacity-100" disabled={isSending} onClick={onSendToSignatories}>
									Send
								</Button>

								<Separator orientation="vertical" className="h-4" />

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button className="disabled:opacity-100" disabled={isSending}>
											<ChevronDown size={12} />
										</Button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="end" className="w-44">
										<DropdownMenuGroup>
											<DocumentDupForSignature document={doc} emails={signatories.map(signatory => (employees?.find(employee => employee.id == signatory.contract)?.profile as any)?.email)} signatures={signatories}>
												<DropdownMenuItem onSelect={event => event.preventDefault()}>Duplicate and Send</DropdownMenuItem>
											</DocumentDupForSignature>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					)}
				</div>
			)}
		</section>
	);
};
