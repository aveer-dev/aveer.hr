'use client';

import { generateRandomString } from '@/utils/generate-string';
import {
	BlockquoteFigure,
	Color,
	Dropcursor,
	Emoji,
	// Figcaption,
	FileHandler,
	Focus,
	FontSize,
	Heading,
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
import uploadImage from '../lib/api';

import { ImageUpload } from './ImageUpload';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface ExtensionKitProps {
	provider?: HocuspocusProvider | null;
}

export const ExtensionKit = ({ provider }: ExtensionKitProps) => [
	Selection,
	HorizontalRule,
	StarterKit.configure({ dropcursor: false, horizontalRule: false, document: false, heading: false, history: false }),
	TextStyle,
	FontSize,
	Color,
	TrailingNode,
	Link.configure({
		openOnClick: false
	}),
	Highlight.configure({ multicolor: true }),
	Underline,
	Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
	// CharacterCount.configure({ limit: 50000 }),
	ImageUpload.configure(),
	ImageBlock.configure({ allowBase64: false }),
	FileHandler.configure({
		allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
		onDrop: (currentEditor, files, pos) => {
			files.forEach(async file => {
				const url = await uploadImage(file, `/${generateRandomString(10)}`, 'documents-assets');

				currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
			});
		},
		onPaste: (currentEditor, files) => {
			files.forEach(async file => {
				const url = await uploadImage(file, `/${generateRandomString(10)}`, 'documents-assets');

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
