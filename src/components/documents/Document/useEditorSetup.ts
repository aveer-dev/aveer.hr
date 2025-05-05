// This hook will manage Tiptap editor setup, extensions, and onUpdate logic

import { useEditor, Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { SlashCommand } from '@/components/tiptap/extensions/SlashCommand';
import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { Details, DetailsContent, DetailsSummary, Placeholder, Table, TableCell, TableHeader, TableRow, UniqueID } from '@/components/tiptap/extensions';
import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { useTiptapCloudCollab } from './useTiptapCloudCollab';

export const useEditorSetup = ({ doc, currentUser, userPermittedAction, saveDocument, debouncedSaveCallback, contentChanged, documentName, setContentChanged, appId, collabToken }: any) => {
	const { ydoc, awareness, color } = useTiptapCloudCollab({
		docId: String(doc.id),
		appId,
		token: collabToken,
		name: currentUser?.name || 'Anonymous'
	});

	const editor = useEditor({
		extensions: [
			TiptapDocument,
			...ExtensionKit,
			Collaboration.configure({
				document: ydoc,
				field: 'content'
			}),
			CollaborationCursor.configure({
				provider: awareness,
				user: currentUser
					? {
							name: currentUser.name,
							color: color,
							avatar: currentUser.avatar
						}
					: undefined
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
			if (doc.locked || doc.signed_lock) return;
			const newContent = editor.getHTML();
			if (newContent !== doc.html) {
				setContentChanged(true);
				debouncedSaveCallback(newContent);
			}
		},
		editable: !doc?.locked || userPermittedAction() === 'editor' || userPermittedAction() === 'owner'
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
			if (editor && !doc.documentState?.isSaved && contentChanged) {
				saveDocument(editor.getHTML());
			}
		};
		window.addEventListener('online', handleOnline);
		return () => window.removeEventListener('online', handleOnline);
	}, [editor, doc.documentState?.isSaved, saveDocument, contentChanged]);

	// Save document when component unmounts if there are unsaved changes
	useEffect(() => {
		return () => {
			if (editor && !doc.documentState?.isSaved && contentChanged) {
				debouncedSaveCallback.cancel();
				saveDocument(editor.getHTML());
			}
		};
	}, [editor, doc.documentState?.isSaved, saveDocument, contentChanged, debouncedSaveCallback]);

	// Handle document name changes
	useEffect(() => {
		if (documentName !== doc.name && !doc.locked && !doc.signed_lock) {
			setContentChanged(true);
			if (editor) {
				debouncedSaveCallback(editor.getHTML());
			}
		}
	}, [documentName, doc.name, doc.locked, doc.signed_lock, editor, debouncedSaveCallback, setContentChanged]);

	useEffect(() => {
		if (editor) editor.setEditable(!doc?.locked && !doc.signed_lock && (userPermittedAction() === 'editor' || userPermittedAction() === 'owner'));
	}, [doc?.locked, doc.signed_lock, editor, userPermittedAction]);

	return { editor };
};
