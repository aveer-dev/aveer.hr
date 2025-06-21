import { EmojiItem } from '@tiptap/extension-emoji';

export interface Command {
	name: string;
}

export interface EmojiListProps {
	command: (command: Command) => void;
	items: EmojiItem[];
}
