'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ImagePlus, Send, Timer } from 'lucide-react';
import { useRef } from 'react';
import { SlashCommand } from './SlashCommand';
import './styles.scss';

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
			<div ref={menuContainerRef}>
				<EditorContent className="overflow-auto" editor={editor} />
			</div>

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
