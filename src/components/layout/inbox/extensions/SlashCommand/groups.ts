import { Heading1, Heading2, Heading3, List, ListOrdered, ListTodo, ListCollapse, Quote, SquareCode, Table, Columns2, Minus, Book, Image } from 'lucide-react';
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
			}
		]
	},
	{
		name: 'insert',
		title: 'Insert',
		commands: [
			// {
			// 	name: 'image',
			// 	label: 'Image',
			// 	iconName: Image,
			// 	description: 'Insert an image',
			// 	aliases: ['img'],
			// 	action: (editor: any) => {
			// 		editor.chain().focus().setImageUpload().run();
			// 	}
			// },
			{
				name: 'horizontalRule',
				label: 'Horizontal Rule',
				iconName: Minus,
				description: 'Insert a horizontal divider',
				aliases: ['hr'],
				action: (editor: any) => {
					editor.chain().focus().setHorizontalRule().run();
				}
			}
		]
	}
];

export default GROUPS;
