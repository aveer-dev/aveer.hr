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
	StarterKit,
	Subscript,
	Superscript,
	TextAlign,
	TextStyle,
	TrailingNode,
	Typography,
	Underline,
	emojiSuggestion
} from '.';

import { ImageUpload } from './ImageUpload';

export const ExtensionKit: any = [
	Selection,
	HorizontalRule,
	StarterKit.configure({ dropcursor: false, horizontalRule: false, document: false }),
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
	Focus,
	// Figcaption,
	BlockquoteFigure,
	Dropcursor.configure({
		width: 2,
		class: 'ProseMirror-dropcursor border-black'
	})
];

export default ExtensionKit;
