import { Icon } from '../../Icon';
import { Toolbar } from '../../Toolbar';
import DragHandle from '@tiptap-pro/extension-drag-handle-react';
import { Editor } from '@tiptap/react';

import useContentItemActions from './hooks/useContentItemActions';
import { useData } from './hooks/useData';
import { ButtonHTMLAttributes, useEffect, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PopoverClose } from '@radix-ui/react-popover';

export type ContentItemMenuProps = {
	editor: Editor;
};

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const data = useData();
	const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos);

	useEffect(() => {
		if (menuOpen) {
			editor.commands.setMeta('lockDragHandle', true);
		} else {
			editor.commands.setMeta('lockDragHandle', false);
		}
	}, [editor, menuOpen]);

	const PopoverButton = ({ children, variant = 'ghost', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) => {
		return (
			<PopoverClose asChild>
				<Button {...props} variant={variant} className="h-fit justify-start gap-2 p-1.5">
					{children}
				</Button>
			</PopoverClose>
		);
	};

	return (
		<DragHandle
			pluginKey="ContentItemMenu"
			editor={editor}
			onNodeChange={data.handleNodeChange}
			tippyOptions={{
				offset: [-1, 12],
				zIndex: 10
			}}>
			<div className="flex items-center gap-0.5">
				<Toolbar.Button onClick={actions.handleAdd} className="p-1.5">
					<Icon name="Plus" />
				</Toolbar.Button>

				<Popover open={menuOpen} onOpenChange={setMenuOpen}>
					<PopoverTrigger asChild>
						<Button variant={'ghost'} className="h-fit w-fit p-1.5">
							<Icon name="GripVertical" size={14} />
						</Button>
					</PopoverTrigger>

					<PopoverContent className="w-56 space-y-1 p-2 *:w-full" onOpenAutoFocus={event => event.preventDefault()} side="bottom" align="start" sideOffset={8}>
						<PopoverButton onClick={actions.resetTextFormatting}>
							<Icon name="RemoveFormatting" />
							Clear formatting
						</PopoverButton>

						<PopoverButton onClick={actions.copyNodeToClipboard}>
							<Icon name="Clipboard" />
							Copy to clipboard
						</PopoverButton>

						<PopoverButton onClick={actions.duplicateNode}>
							<Icon name="Copy" />
							Duplicate
						</PopoverButton>

						<Toolbar.Divider horizontal />

						<PopoverButton onClick={actions.deleteNode} variant={'secondary_destructive'}>
							<Icon name="Trash2" />
							Delete
						</PopoverButton>
					</PopoverContent>
				</Popover>
			</div>
		</DragHandle>
	);
};
