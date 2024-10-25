'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Send, Timer } from 'lucide-react';
import { useRef } from 'react';
import './styles.scss';
import { SlashCommand } from './extensions';
import { TextMenu } from './components/menus/TextMenu';
import { ContentItemMenu, LinkMenu } from './components/menus';
import ImageBlockMenu from './extensions/ImageBlock/components/ImageBlockMenu';

export const MessageInput = () => {
	const menuContainerRef = useRef(null);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: 'Message starts here...'
			}),
			SlashCommand
		],
		content: '<p>Hello World! 🌎️</p>',
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: 'h-[73vh] w-full resize-none bg-transparent text-sm font-light leading-6 outline-none'
			}
		}
	});

	return (
		<>
			{!!editor && (
				<div ref={menuContainerRef}>
					<EditorContent className="overflow-auto" editor={editor} />
					<ContentItemMenu editor={editor} />
					<LinkMenu editor={editor} appendTo={menuContainerRef} />
					<TextMenu editor={editor} />
					<ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
				</div>
			)}

			<Separator />

			<div className="flex items-center justify-end gap-4">
				<Button className="gap-3" variant={'outline'}>
					<Timer size={12} /> Schedule Message
				</Button>

				<Button className="gap-3 px-8">
					Send <Send size={12} />
				</Button>
			</div>
		</>
	);
};
