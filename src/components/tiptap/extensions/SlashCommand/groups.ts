import { Heading1, Heading2, Heading3, List, ListOrdered, ListCollapse, Quote, Table, Columns2, Minus, Book, Image, Signature } from 'lucide-react';
import { Group } from './types';

export const GROUPS: Group[] = [
	{
		name: 'format',
		title: 'Format',
		commands: [
			{
				name: 'heading1',
				label: 'Heading 1',
				iconName: Heading1,
				description: 'High priority section title',
				aliases: ['h1'],
				action: (editor: any) => {
					editor.chain().focus().setHeading({ level: 1 }).run();
				}
			},
			{
				name: 'heading2',
				label: 'Heading 2',
				iconName: Heading2,
				description: 'Medium priority section title',
				aliases: ['h2'],
				action: (editor: any) => {
					editor.chain().focus().setHeading({ level: 2 }).run();
				}
			},
			{
				name: 'heading3',
				label: 'Heading 3',
				iconName: Heading3,
				description: 'Low priority section title',
				aliases: ['h3'],
				action: (editor: any) => {
					editor.chain().focus().setHeading({ level: 3 }).run();
				}
			},
			{
				name: 'bulletList',
				label: 'Bullet List',
				iconName: List,
				description: 'Unordered list of items',
				aliases: ['ul'],
				action: (editor: any) => {
					editor.chain().focus().toggleBulletList().run();
				}
			},
			{
				name: 'numberedList',
				label: 'Numbered List',
				iconName: ListOrdered,
				description: 'Ordered list of items',
				aliases: ['ol'],
				action: (editor: any) => {
					editor.chain().focus().toggleOrderedList().run();
				}
			},
			{
				name: 'toggleList',
				label: 'Toggle List',
				iconName: ListCollapse,
				description: 'Toggles can show and hide content',
				aliases: ['toggle'],
				action: editor => {
					editor.chain().focus().setDetails().run();
				}
			},
			{
				name: 'blockquote',
				label: 'Blockquote',
				iconName: Quote,
				description: 'Element for quoting',
				action: editor => {
					editor.chain().focus().setBlockquote().run();
				}
			}
		]
	},
	{
		name: 'insert',
		title: 'Insert',
		commands: [
			{
				name: 'table',
				label: 'Table',
				iconName: Table,
				description: 'Insert a table',
				shouldBeHidden: editor => editor.isActive('columns'),
				action: editor => {
					editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
				}
			},
			{
				name: 'image',
				label: 'Image',
				iconName: Image,
				description: 'Insert an image',
				aliases: ['img'],
				action: (editor: any) => {
					editor.chain().focus().setImageUpload().run();
				}
			},
			{
				name: 'horizontalRule',
				label: 'Horizontal Rule',
				iconName: Minus,
				description: 'Insert a horizontal divider',
				aliases: ['hr'],
				action: (editor: any) => {
					editor.chain().focus().setHorizontalRule().run();
				}
			},
			// {
			// 	name: 'signatureFigure',
			// 	label: 'Signature Slot',
			// 	iconName: Signature,
			// 	description: 'Insert a signature slot',
			// 	action: (editor: any) => {
			// 		editor.chain().focus().setSignatureSlot().run();
			// 	}
			// },
			{
				name: 'toc',
				label: 'Table of Contents',
				iconName: Book,
				aliases: ['outline'],
				description: 'Insert a table of contents',
				shouldBeHidden: editor => editor.isActive('columns'),
				action: editor => {
					editor.chain().focus().insertTableOfContents().run();
				}
			},
			{
				name: 'columns',
				label: 'Columns',
				iconName: Columns2,
				description: 'Add two column content',
				aliases: ['cols'],
				shouldBeHidden: editor => editor.isActive('columns'),
				action: editor => {
					editor
						.chain()
						.focus()
						.setColumns()
						.focus(editor.state.selection.head - 1)
						.run();
				}
			}
		]
	}
];

export default GROUPS;
