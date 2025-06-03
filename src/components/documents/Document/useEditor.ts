'use client';

import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorContent, useEditor as useTiptapEditor, useEditorState } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Tables } from '@/type/database.types';
import { ExtensionKit } from '@/components/tiptap/extensions/extension-kit';
import { generateHslaColors } from '@/lib/utils/colors';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import { SlashCommand } from '@/components/tiptap/extensions/SlashCommand';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Table, TableCell, TableOfContents, Details, DetailsContent, DetailsSummary, TableHeader, TableRow, Column, Columns, UniqueID, Mention, CustomMention, Placeholder } from '@/components/tiptap/extensions';
// import { DocumentHeader } from '@/components/documents/Document/DocumentHeader';
// import { useDocumentState } from '@/components/documents/Document/useDocumentState';
// import DocumentEditor from './Document/DocumentEditor';
// import { usePathname } from 'next/navigation';
// import { useRouter } from 'next/navigation';
import { DOCUMENT_ACCESS_TYPE } from '../types';

function initials(name: string) {
	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase();
}

// --- Main Page ---
export const useEditor = ({ provider, dbDoc, profile, currentUserId }: { provider: HocuspocusProvider; dbDoc: Tables<'documents'> & { org: { name: string; subdomain: string } }; profile: Tables<'profiles'>; currentUserId: string }) => {
	// const resolvedFileId = fileId ?? dbDoc.id;

	const userPermittedAction = useCallback((): DOCUMENT_ACCESS_TYPE => {
		if (currentUserId == dbDoc.owner) return 'owner';
		const userAccess = (dbDoc.shared_with as unknown as { contract: number; profile: string; access: 'editor' | 'viewer' | 'owner' }[]).find(person => person.profile == currentUserId);
		return userAccess?.access as DOCUMENT_ACCESS_TYPE;
	}, [currentUserId, dbDoc]);

	// const handleBack = useCallback(() => {
	// 	// Force a refresh of the previous page
	// 	const documentsPath = pathname.split('/').slice(0, -1).join('/');
	// 	router.push(documentsPath);
	// 	router.refresh();
	// }, [router, pathname]);

	// Always initialize the editor with schema
	const editor = useTiptapEditor({
		extensions: [
			TiptapDocument,
			...ExtensionKit({ provider }),
			Collaboration.configure({
				document: provider.document
			}),
			CollaborationCursor.configure({
				provider,
				user: {
					name: `${profile.first_name} ${profile.last_name}`,
					color: '#eee',
					id: profile.id
				}
			}),
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
				types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table', 'imageBlock']
			}),
			// CustomMention.configure({ suggestion }),
			Placeholder.configure({
				includeChildren: true,
				showOnlyCurrent: false,
				placeholder: () => 'Start writing here'
			})
		],
		immediatelyRender: false,
		autofocus: true,
		editorProps: {
			attributes: {
				class: 'prose w-full min-h-[80vh] px-8 resize-none bg-transparent text-base font-light leading-6 outline-none'
			}
		}
	});

	const users = useEditorState({
		editor,
		selector: ctx => {
			if (!ctx.editor?.storage.collaborationCursor?.users) {
				return [];
			}

			return ctx.editor.storage.collaborationCursor.users.map((user: any) => {
				return user;
			});
		}
	});

	return { editor, users, userPermittedAction };
};
