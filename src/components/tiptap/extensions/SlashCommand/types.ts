import { Editor } from '@tiptap/core';

import { icons, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface Group {
	name: string;
	title: string;
	commands: Command[];
}

export interface Command {
	name: string;
	label: string;
	description: string;
	aliases?: string[];
	iconName: LucideIcon;
	action: (editor: Editor) => void;
	shouldBeHidden?: (editor: Editor) => boolean;
}

export interface MenuListProps {
	editor: Editor;
	items: Group[];
	command: (command: Command) => void;
}
