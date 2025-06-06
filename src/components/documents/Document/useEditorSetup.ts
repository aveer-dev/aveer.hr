// This hook will manage Tiptap editor setup, extensions, and onUpdate logic

import { useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { Document as TiptapDocument } from '@/components/tiptap/extensions/Document';
import ExtensionKit from '@/components/tiptap/extensions/extension-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { SlashCommand } from '@/components/tiptap/extensions/SlashCommand';
// import TableOfContents from '@tiptap-pro/extension-table-of-contents';
import { Placeholder, Table, TableCell, TableHeader, TableRow } from '@/components/tiptap/extensions';
// import { TableOfContentsNode } from '@/components/tiptap/extensions/TableOfContentsNode';
import { Column, Columns } from '@/components/tiptap/extensions/MultiColumn';
import { CustomMention, suggestion } from '@/components/tiptap/extensions/Mention';
import { useTiptapCloudCollab } from './useTiptapCloudCollab';

export const useEditorSetup = ({ doc, currentUser, userPermittedAction, saveDocument, debouncedSaveCallback, contentChanged, documentName, setContentChanged, appId, collabToken }: any) => {
	// const { ydoc, awareness, color } = useTiptapCloudCollab({
	// 	docId: String(doc.id),
	// 	appId,
	// 	token: collabToken,
	// 	name: currentUser?.name || 'Anonymous'
	// });

	const initialDocId = useRef<string | number | null>(null);

	const editor = useEditor({
		extensions: [
			TiptapDocument,
			...ExtensionKit,
			// Collaboration.configure({
			// 	document: ydoc,
			// 	field: 'content'
			// }),
			// CollaborationCursor.configure({
			// 	provider: awareness,
			// 	user: currentUser
			// 		? {
			// 				name: currentUser.name,
			// 				color: color,
			// 				avatar: currentUser.avatar
			// 			}
			// 		: undefined
			// }),
			SlashCommand,
			// TableOfContents.configure({
			// 	anchorTypes: ['heading', 'customAnchorType']
			// }),
			// Details.configure({
			// 	persist: true,
			// 	HTMLAttributes: {
			// 		class: 'details'
			// 	}
			// }),
			// DetailsContent,
			// DetailsSummary,
			// TableOfContentsNode,
			Table,
			TableCell,
			TableHeader,
			TableRow,
			Column,
			Columns,
			// UniqueID.configure({
			// 	attributeName: 'id',
			// 	types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table', 'imageBlock']
			// }),
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
			const newJson = editor.getJSON();
			if (newContent !== doc.html) {
				setContentChanged(true);
				debouncedSaveCallback({ html: newContent, json: newJson });
			}
		},
		editable: !doc?.locked || userPermittedAction() === 'editor' || userPermittedAction() === 'owner'
	});

	// Only set content on initial mount or document switch
	useEffect(() => {
		if (editor && !contentChanged && doc.id !== initialDocId.current) {
			if (doc.json) {
				try {
					editor.commands.setContent(doc.json, true);
				} catch (e) {
					// fallback to html if json is invalid
					editor.commands.setContent(doc.html, true);
				}
			} else if (doc.html) {
				editor.commands.setContent(doc.html, true);
			}
			initialDocId.current = doc.id;
		}
	}, [editor, doc.html, doc.json, contentChanged, doc.id]);

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
