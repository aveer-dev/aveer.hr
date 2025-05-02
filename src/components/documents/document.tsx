'use client';

import '@/styles/index.css';

import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { Details, DetailsContent, DetailsSummary, Placeholder, SignatureFigure, SignatureImage, SlashCommand, Table, TableCell, TableHeader, TableRow, UniqueID } from '@/components/tiptap/extensions';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Tables } from '@/type/database.types';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { TableColumnMenu, TableRowMenu } from '@/components/tiptap/extensions/Table/menus';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { DocumentSettingsDialog } from './document-settings-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, Cloud, CloudOff, CloudUpload, Globe, GlobeLock, Info, LockKeyhole, Trash2, UnlockKeyhole, Copy } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { sendToSignatories, updateDocument } from './document.actions';
import { toast } from 'sonner';
import { DocumentOptions } from './document-options';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AddSignatoryDialog } from './add-signatory-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentDupForSignature } from './document-dup-signature-dialog';
import ImageBlockMenu from '../tiptap/extensions/ImageBlock/components/ImageBlockMenu';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import Collaboration from '@tiptap/extension-collaboration';
import { DocumentMetadata, DocumentState, SHARED_WITH, SignatoryInfo } from './types';
import debounce from 'lodash/debounce';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { WebrtcProvider } from 'y-webrtc';
import { generateHslaColors } from '@/lib/utils/colors';
import * as awarenessProtocol from 'y-protocols/awareness';

interface PROPS {
	doc: Tables<'documents'>;
	currentUserId?: string;
	employees?: Tables<'contracts'>[] | null;
	parentContainerId?: string;
}

interface AwarenessState {
	user?: User;
	[key: string]: any;
}

interface User {
	name: string;
	color: string;
	id: string;
}

export const Document = ({ doc: initialDoc, currentUserId, employees, parentContainerId }: PROPS) => {
	const router = useRouter();
	const pathname = usePathname();
	const menuContainerRef = useRef(null);

	const updateDocMetadata = useCallback((prev: DocumentMetadata, updates: Partial<Tables<'documents'>>) => {
		return {
			...prev,
			...updates,
			// Maintain the DocumentMetadata structure
			org: {
				subdomain: typeof updates.org === 'string' ? updates.org : prev.org.subdomain
			},
			shared_with: prev.shared_with,
			signed_lock: updates.signed_lock ?? prev.signed_lock,
			private: updates.private ?? prev.private,
			signatures: prev.signatures
		} as DocumentMetadata;
	}, []);

	const handleBack = useCallback(() => {
		// Force a refresh of the previous page
		const documentsPath = pathname.split('/').slice(0, -1).join('/');
		router.push(documentsPath);
		router.refresh();
	}, [router, pathname]);

	const [name, updateName] = useState(initialDoc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [doc, setDoc] = useState<DocumentMetadata>({
		...initialDoc,
		org: initialDoc.org as any,
		shared_with: (initialDoc?.shared_with as any) || [],
		signatures: (initialDoc.signatures as any) || [],
		version: initialDoc.version as string
	});

	const [documentState, setDocumentState] = useState<DocumentState>({
		isSaving: false,
		isSaved: true,
		lastSavedVersion: (initialDoc.version as string) || null,
		error: null
	});

	const [signatories, updateSignatories] = useState<SignatoryInfo[]>(
		Array.isArray(initialDoc.signatures)
			? (initialDoc.signatures as any[]).map(sig => ({
					id: sig.id,
					contract: sig.contract,
					profile: sig.profile
				}))
			: []
	);
	const [isSending, setSendingState] = useState(false);
	const [contentChanged, setContentChanged] = useState(false);

	// Initialize Y.js document
	const ydoc = useRef<Y.Doc | null>(null);
	const [provider, setProvider] = useState<IndexeddbPersistence | null>(null);
	const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(null);
	const [activeUsers, setActiveUsers] = useState<User[]>([]);

	// Get current user info
	const currentUser = useMemo(() => {
		const employee = employees?.find(emp => (emp.profile as any).id === currentUserId);
		if (!employee) return null;

		return {
			name: `${(employee.profile as any).first_name} ${(employee.profile as any).last_name}`,
			id: currentUserId as string,
			color: generateHslaColors(currentUserId as string)
		};
	}, [currentUserId, employees]);

	// Initialize collaboration only on client side
	useEffect(() => {
		if (typeof window === 'undefined' || ydoc.current) return;

		const initCollaboration = async () => {
			try {
				ydoc.current = new Y.Doc();

				// Initialize IndexedDB provider for offline persistence
				const newProvider = new IndexeddbPersistence(`document-${doc.id}`, ydoc.current);
				await new Promise<void>(resolve => newProvider.once('synced', () => resolve()));
				setProvider(newProvider);

				// Initialize WebRTC provider for real-time collaboration
				const rtcProvider = new WebrtcProvider(`document-${doc.id}`, ydoc.current, {
					awareness: new awarenessProtocol.Awareness(ydoc.current)
				});

				// Handle awareness updates
				rtcProvider.awareness.setLocalState({
					user: currentUser
				});

				rtcProvider.awareness.on('change', () => {
					const states = Array.from(rtcProvider.awareness.getStates().values());
					const users = states
						.filter((state: unknown): state is AwarenessState => {
							const awarenessState = state as AwarenessState;
							return awarenessState?.user !== undefined;
						})
						.map(state => state.user as User)
						.filter((user): user is User => user !== undefined);

					setActiveUsers(users);
				});

				setWebrtcProvider(rtcProvider);
			} catch (error) {
				console.error('Failed to initialize collaboration:', error);
			}
		};

		if (currentUser) {
			initCollaboration();
		}

		return () => {
			provider?.destroy();
			webrtcProvider?.destroy();
			ydoc.current?.destroy();
			ydoc.current = null;
		};
	}, [doc.id, provider, currentUser, currentUserId, webrtcProvider]);

	const updateDocumentState = useCallback((updates: Partial<DocumentState>) => {
		setDocumentState(prev => ({
			...prev,
			...updates
		}));
	}, []);

	const getEmployee = useCallback(
		(employeeId?: number) => {
			const employee = employeeId ? employees?.find(employee => employee.id == employeeId) : employees?.find(employee => (employee.profile as any).id == currentUserId);
			return employee as Tables<'contracts'>;
		},
		[employees, currentUserId]
	);

	const userPermittedAction = useCallback(() => {
		if (currentUserId == doc.owner) return 'owner';
		const userAccess = (doc.shared_with as unknown as { contract: number; profile: string; access: 'editor' | 'viewer' | 'owner' }[]).find(person => person.profile == currentUserId);
		return userAccess?.access;
	}, [currentUserId, doc.owner, doc.shared_with]);

	const saveDocument = useCallback(
		async (content: string) => {
			if (!currentUserId || doc.locked || doc.signed_lock || !contentChanged || userPermittedAction() == undefined || userPermittedAction() == 'viewer') return;

			updateDocumentState({ isSaving: true, isSaved: false });

			try {
				const result = await updateDocument({
					name: documentName,
					id: doc?.id,
					org: doc.org.subdomain,
					html: content,
					version: documentState.lastSavedVersion
				});

				if (result.error) throw result.error;

				if (result.data) {
					const updatedDoc: DocumentMetadata = {
						...result.data,
						org: result.data.org as any,
						shared_with: (result.data.shared_with as any[]) || [],
						signatures: (result.data.signatures as any[]) || [],
						version: result.data.version as string
					};

					// Update signatories separately to maintain type safety
					const newSignatories = Array.isArray(result.data.signatures)
						? (result.data.signatures as any[]).map(sig => ({
								id: sig.id,
								contract: sig.contract,
								profile: sig.profile
							}))
						: [];

					updateSignatories(newSignatories);
					setDoc(updatedDoc);

					updateDocumentState({
						isSaving: false,
						isSaved: true,
						lastSavedVersion: updatedDoc.version,
						error: null
					});

					setContentChanged(false);
				}
			} catch (error: any) {
				updateDocumentState({
					isSaving: false,
					isSaved: false,
					error: error.message
				});

				toast.error(error.message);
			}
		},
		[currentUserId, doc.locked, doc.signed_lock, doc?.id, doc.org.subdomain, contentChanged, userPermittedAction, updateDocumentState, documentName, documentState.lastSavedVersion]
	);

	const debouncedSaveCallback = useMemo(
		() =>
			debounce((content: string) => {
				if (contentChanged) {
					saveDocument(content);
				}
			}, 1000),
		[contentChanged, saveDocument]
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSaveCallback.cancel();
		};
	}, [debouncedSaveCallback]);

	const editor = useEditor({
		extensions: [
			TiptapDocument,
			SignatureFigure.configure({
				profile: getEmployee()?.profile,
				uploadPath: `${getEmployee()?.org}/${getEmployee()?.id}`,
				onSignDocuemnt: updateDocument,
				document: doc,
				signatories
			}),
			...ExtensionKit,
			...(ydoc.current
				? [
						Collaboration.configure({
							document: ydoc.current,
							field: 'content'
						}),
						CollaborationCursor.configure({
							provider: webrtcProvider?.awareness,
							user: currentUser
								? {
										name: currentUser.name,
										color: currentUser.color
									}
								: undefined
						})
					]
				: []),
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
				types: ['paragraph', 'signatureFigure', 'heading', 'blockquote', 'codeBlock', 'table', 'signatureUpload', 'imageBlock']
			}),
			SignatureImage,
			CustomMention.configure({ suggestion }),
			Placeholder.configure({
				includeChildren: true,
				showOnlyCurrent: false,
				placeholder: () => 'Start writing here'
			})
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

			// Only mark as changed if content actually changed
			const newContent = editor.getHTML();
			if (newContent !== doc.html) {
				setContentChanged(true);
				debouncedSaveCallback(newContent);
			}
		},
		editable: !doc?.locked || userPermittedAction() == 'editor' || userPermittedAction() == 'owner'
	});

	// Update editor content when doc changes
	useEffect(() => {
		if (editor && doc.html && !contentChanged) {
			editor.commands.setContent(doc.html);
		}
	}, [editor, doc.html, contentChanged]);

	// Handle offline/online status
	useEffect(() => {
		const handleOnline = () => {
			if (editor && !documentState.isSaved && contentChanged) {
				saveDocument(editor.getHTML());
			}
		};

		window.addEventListener('online', handleOnline);
		return () => window.removeEventListener('online', handleOnline);
	}, [editor, documentState.isSaved, saveDocument, contentChanged]);

	// Save document when component unmounts if there are unsaved changes
	useEffect(() => {
		return () => {
			if (editor && !documentState.isSaved && contentChanged) {
				// Cancel any pending debounced saves
				debouncedSaveCallback.cancel();
				// Save immediately
				saveDocument(editor.getHTML());
			}
		};
	}, [editor, documentState.isSaved, saveDocument, contentChanged, debouncedSaveCallback]);

	// Handle document name changes
	useEffect(() => {
		if (documentName !== doc.name && !doc.locked && !doc.signed_lock) {
			setContentChanged(true);
			if (editor) {
				debouncedSaveCallback(editor.getHTML());
			}
		}
	}, [documentName, doc.name, doc.locked, doc.signed_lock, editor, debouncedSaveCallback]);

	const onUpdateSignatures = (editor: Editor) => {
		const { content } = editor.state.doc.content;
		const signatures = content.filter(node => node.type.name === 'signatureFigure' || node.type.name === 'signatureUpload' || node.type.name === 'signatureImage');

		// Create a map of existing signatories for efficient lookup
		const existingSignatoriesMap = new Map(signatures.map(signatory => [signatory.attrs?.id, signatory]));

		// Build updated signatories array
		const updatedSignatories = signatures.map(signature => ({
			id: signature.attrs?.id,
			contract: signature.attrs?.contract,
			profile: signature.attrs?.profile
		})) as SignatoryInfo[];

		updateSignatories(updatedSignatories);
	};

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
			{/* Show active users */}
			{activeUsers.length > 0 && (
				<div className="fixed right-4 top-20 flex -space-x-2 overflow-hidden">
					{activeUsers.map(user => (
						<div key={user.id} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100" style={{ backgroundColor: user.color }} title={user.name}>
							{user.name.charAt(0)}
						</div>
					))}
				</div>
			)}

			<div className="relative space-y-6">
				<div className="mx-8 mb-8 flex items-center justify-between border-b pb-6">
					<div className="flex w-full items-center gap-3 text-sm font-light text-muted-foreground">
						{currentUserId && (
							<button onClick={handleBack} disabled={documentState.isSaving || contentChanged} className={cn(buttonVariants({ variant: 'secondary' }), 'rounded-full')}>
								<ChevronLeft size={14} />
							</button>
						)}

						{currentUserId && (
							<Input
								value={name}
								readOnly={doc.locked || doc.signed_lock || userPermittedAction() == 'viewer'}
								onChange={event => updateName(event.target.value)}
								className={cn('w-full max-w-[600px] px-0.5 py-2 pl-2 text-sm font-medium text-primary outline-none')}
								placeholder="Enter document's name"
							/>
						)}
						{!currentUserId && <h1 className={cn('w-full px-0.5 py-2 pl-2 text-2xl font-bold text-primary')}>{name}</h1>}
					</div>

					{doc && (!doc.locked || !doc.signed_lock || userPermittedAction() !== 'viewer') && currentUserId && (
						<div className="flex items-center gap-3">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
											{documentState.isSaving && <CloudUpload className="animate-bounce" size={14} />}
											{documentState.isSaved && <Cloud size={14} />}
											{!documentState.isSaved && !documentState.isSaving && <CloudOff size={14} />}
										</Button>
									</TooltipTrigger>

									<TooltipContent>
										<p className="max-w-40">
											{documentState.isSaving && 'Saving changes...'}
											{documentState.isSaved && 'All changes saved'}
											{!documentState.isSaved && !documentState.isSaving && 'Changes not saved'}
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
											{doc?.locked && <LockKeyhole size={14} />}
											{!doc?.locked && <UnlockKeyhole size={14} />}
										</Button>
									</TooltipTrigger>

									<TooltipContent>
										<p className="max-w-40">Document is {doc?.locked ? 'locked and cannot be edited by anyone' : 'unlocked and can be edited by anyone with edit access'}.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant={'ghost'} disabled className="disabled:pointer-events-auto disabled:opacity-100">
											{!doc.private && <Globe size={14} />}
											{doc.private && <GlobeLock size={14} />}
										</Button>
									</TooltipTrigger>

									<TooltipContent>
										<p className="max-w-40">Document is {doc.private ? 'private, only visible to you and people with access' : 'visible to anyone on the internet or with document link.'}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<DocumentSettingsDialog
								employees={employees}
								doc={{
									...initialDoc,
									name,
									org: doc.org.subdomain
								}}
								currentUserId={currentUserId}
							/>
							<DocumentOptions
								currentUserId={currentUserId}
								document={doc as unknown as Tables<'documents'>}
								onStateChange={updates => {
									setDoc(prev => updateDocMetadata(prev, updates));
								}}
							/>
						</div>
					)}
				</div>

				<div ref={menuContainerRef}>
					<EditorContent editor={editor} className="flex-1 overflow-y-auto" />
					<ContentItemMenu editor={editor} disabled={doc.locked || doc.signed_lock || !userPermittedAction() || userPermittedAction() == 'viewer'} />
					<LinkMenu editor={editor} appendTo={menuContainerRef} />
					<TextMenuBubble editor={editor} />
					<ColumnsMenu editor={editor} appendTo={menuContainerRef} />
					<TableRowMenu editor={editor} appendTo={menuContainerRef} />
					<TableColumnMenu editor={editor} appendTo={menuContainerRef} />
					<ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
				</div>
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
											<DocumentDupForSignature
												document={{
													...initialDoc,
													org: doc.org.subdomain
												}}
												emails={signatories.map(signatory => (employees?.find(employee => employee.id == signatory.contract)?.profile as any)?.email)}
												signatures={signatories}>
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
