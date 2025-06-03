'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
// import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Tables } from '@/type/database.types';
import { ExtensionKit } from '@/components/tiptap/extensions/extension-kit';
import { generateHslaColors } from '@/lib/utils/colors';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { SlashCommand } from '@/components/tiptap/extensions/SlashCommand';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Table, TableCell, TableOfContents, Details, DetailsContent, DetailsSummary, TableHeader, TableRow, Column, Columns, UniqueID, Mention, CustomMention, Placeholder } from '@/components/tiptap/extensions';
import { DocumentHeader } from '@/components/documents/Document/DocumentHeader';
import { useDocumentState } from '@/components/documents/Document/useDocumentState';
import DocumentEditor from './Document/DocumentEditor';
import { DOCUMENT_ACCESS_TYPE } from './types';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEditor } from './Document/useEditor';
import { Editor as TiptapEditor } from '@tiptap/react';

function initials(name: string) {
	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase();
}

// --- Main Page ---
export default function Editor({ editor, users, userPermittedAction, dbDoc }: { editor: TiptapEditor; users: any[]; userPermittedAction: () => DOCUMENT_ACCESS_TYPE; dbDoc: Tables<'documents'> & { org: { name: string; subdomain: string } } }) {
	// const { name, updateName, documentName, doc, setDoc, documentState, setDocumentState, contentChanged, setContentChanged, updateDocMetadata, updateDocumentState } = useDocumentState(dbDoc);
	const router = useRouter();
	const pathname = usePathname();

	// const resolvedFileId = fileId ?? dbDoc.id;

	// const userPermittedAction = useCallback((): DOCUMENT_ACCESS_TYPE => {
	// 	if (currentUserId == doc.owner) return 'owner';
	// 	const userAccess = (doc.shared_with as unknown as { contract: number; profile: string; access: 'editor' | 'viewer' | 'owner' }[]).find(person => person.profile == currentUserId);
	// 	return userAccess?.access as DOCUMENT_ACCESS_TYPE;
	// }, [currentUserId, doc.owner, doc.shared_with]);

	const handleBack = useCallback(() => {
		// Force a refresh of the previous page
		const documentsPath = pathname.split('/').slice(0, -1).join('/');
		router.push(documentsPath);
		router.refresh();
	}, [router, pathname]);

	// Always initialize the editor with schema
	// const editor = useEditor({
	// 	extensions: [
	// 		TiptapDocument,
	// 		...ExtensionKit({ provider }),
	// 		Collaboration.configure({
	// 			document
	// 		}),
	// 		CollaborationCursor.configure({
	// 			provider,
	// 			user: {
	// 				name: `${profile.first_name} ${profile.last_name}`,
	// 				color: '#eee',
	// 				id: profile.id
	// 			}
	// 		}),
	// 		SlashCommand,
	// 		TableOfContents.configure({
	// 			anchorTypes: ['heading', 'customAnchorType']
	// 		}),
	// 		Details.configure({
	// 			persist: true,
	// 			HTMLAttributes: {
	// 				class: 'details'
	// 			}
	// 		}),
	// 		DetailsContent,
	// 		DetailsSummary,
	// 		TableOfContentsNode,
	// 		Table,
	// 		TableCell,
	// 		TableHeader,
	// 		TableRow,
	// 		Column,
	// 		Columns,
	// 		UniqueID.configure({
	// 			attributeName: 'id',
	// 			types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table', 'imageBlock']
	// 		}),
	// 		// CustomMention.configure({ suggestion }),
	// 		Placeholder.configure({
	// 			includeChildren: true,
	// 			showOnlyCurrent: false,
	// 			placeholder: () => 'Start writing here'
	// 		})
	// 	],
	// 	immediatelyRender: false,
	// 	autofocus: true,
	// 	editorProps: {
	// 		attributes: {
	// 			class: 'prose w-full min-h-[80vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
	// 		}
	// 	}
	// });

	// const users = useEditorState({
	// 	editor,
	// 	selector: ctx => {
	// 		if (!ctx.editor?.storage.collaborationCursor?.users) {
	// 			return [];
	// 		}

	// 		return ctx.editor.storage.collaborationCursor.users.map((user: any) => {
	// 			return user;
	// 		});
	// 	}
	// });
	// console.log(
	// 	'users',
	// 	users.filter((user: any) => user?.id)
	// );

	return (
		// <div className="flex min-h-screen flex-col items-center bg-neutral-50 py-8 dark:bg-neutral-900">
		// 	{/* Title */}
		// 	<div className="mb-4 w-full max-w-3xl">
		// 		<input className="w-full bg-transparent px-2 py-1 text-3xl font-bold outline-none" defaultValue="Untitled Document" placeholder="Untitled Document" />
		// 	</div>
		// 	{/* Avatars */}
		// 	<div className="mb-2 flex gap-2">
		// 		{awarenessStates.map((u, index) => (
		// 			<div key={`${u.id}-${index}`} title={u.name} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow" style={{ background: u.color }}>
		// 				{initials(u.name)}
		// 			</div>
		// 		))}
		// 	</div>
		// 	{/* Editor */}
		// 	<div className="w-full max-w-3xl rounded-lg border border-neutral-200 bg-white p-4 shadow dark:border-neutral-800 dark:bg-black">{editor ? <EditorContent editor={editor} /> : <div>Loading collaborative editor...</div>}</div>
		// </div>
		// <section className="relative mx-auto max-w-5xl space-y-4">
		// 	{/* <ActiveUsers users={activeUsers} /> */}

		// 	<div className="relative space-y-6">
		// 		<DocumentHeader name={name} updateName={updateName} doc={doc} documentState={documentState} userPermittedAction={userPermittedAction} currentUserId={currentUserId} onBack={handleBack} setDoc={setDoc} updateDocMetadata={updateDocMetadata} fileId={resolvedFileId} />
		<>{editor && <DocumentEditor editor={editor} doc={dbDoc} userPermittedAction={userPermittedAction} />}</>
		// 	</div>
		// </section>
	);
}
