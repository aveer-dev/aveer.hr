'use client';

import { API } from '../lib/api';

import {
	BlockquoteFigure,
	Color,
	Dropcursor,
	Emoji,
	// Figcaption,
	FileHandler,
	Focus,
	FontSize,
	// Heading,
	Highlight,
	HorizontalRule,
	ImageBlock,
	Link,
	Placeholder,
	Selection,
	SlashCommand,
	StarterKit,
	Subscript,
	Superscript,
	TextAlign,
	TextStyle,
	TrailingNode,
	Typography,
	Underline,
	emojiSuggestion,
	UniqueID
} from '.';

import { ImageUpload } from './ImageUpload';
import { isChangeOrigin } from '@tiptap/extension-collaboration';

export const ExtensionKit: any = [
	Document,
	Selection,
	HorizontalRule,
	UniqueID.configure({
		types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table'],
		filterTransaction: transaction => !isChangeOrigin(transaction)
	}),
	StarterKit.configure({
		document: false,
		dropcursor: false,
		heading: false,
		horizontalRule: false,
		blockquote: false,
		history: false,
		codeBlock: false
	}),
	TextStyle,
	FontSize,
	Color,
	TrailingNode,
	Link.configure({
		openOnClick: false
	}),
	Highlight.configure({ multicolor: true }),
	Underline,
	// CharacterCount.configure({ limit: 50000 }),
	ImageUpload.configure(),
	ImageBlock,
	FileHandler.configure({
		allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
		onDrop: (currentEditor, files, pos) => {
			files.forEach(async file => {
				const url = await API.uploadImage(file);

				currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
			});
		},
		onPaste: (currentEditor, files) => {
			files.forEach(async file => {
				const url = await API.uploadImage(file);

				return currentEditor.chain().setImageBlockAt({ pos: currentEditor.state.selection.anchor, src: url }).focus().run();
			});
		}
	}),
	Emoji.configure({
		enableEmoticons: true,
		suggestion: emojiSuggestion
	}),
	TextAlign.extend({
		addKeyboardShortcuts() {
			return {};
		}
	}).configure({
		types: ['heading', 'paragraph']
	}),
	Subscript,
	Superscript,
	Typography,
	Placeholder.configure({
		includeChildren: true,
		showOnlyCurrent: false,
		placeholder: () => ''
	}),
	SlashCommand,
	Focus,
	// Figcaption,
	BlockquoteFigure,
	Dropcursor.configure({
		width: 2,
		class: 'ProseMirror-dropcursor border-black'
	})
];

export default ExtensionKit;
