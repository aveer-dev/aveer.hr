import { Editor } from '@tiptap/react';

import { HorizontalRule, ImageBlock, ImageUpload, Link, SignatureFigure } from '../../extensions';
import { TableOfContentsNode } from '../../extensions/TableOfContentsNode';

export const isTableGripSelected = (node: HTMLElement) => {
	let container = node;

	while (container && !['TD', 'TH'].includes(container.tagName)) {
		container = container.parentElement!;
	}

	const gripColumn = container && container.querySelector && container.querySelector('a.grip-column.selected');
	const gripRow = container && container.querySelector && container.querySelector('a.grip-row.selected');

	if (gripColumn || gripRow) {
		return true;
	}

	return false;
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
	const customNodes = [HorizontalRule.name, ImageBlock.name, ImageUpload.name, Link.name, TableOfContentsNode.name, SignatureFigure.name];

	return customNodes.some(type => editor.isActive(type)) || isTableGripSelected(node);
};

export default isCustomNodeSelected;
