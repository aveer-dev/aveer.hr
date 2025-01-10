import React, { useCallback, useState, type JSX } from 'react';
import { BubbleMenu as BaseBubbleMenu, useEditorState } from '@tiptap/react';

import { MenuProps } from '../types';
import { LinkPreviewPanel } from '../../panels/LinkPreviewPanel';
import { LinkEditorPanel } from '../../panels';
import { cn } from '@/lib/utils';

export const LinkMenu = ({ editor, appendTo }: MenuProps): JSX.Element => {
	const [showEdit, setShowEdit] = useState(false);
	const { link, target } = useEditorState({
		editor,
		selector: ctx => {
			const attrs = ctx.editor.getAttributes('link');
			return { link: attrs.href, target: attrs.target };
		}
	});

	const shouldShow = useCallback(() => {
		const isActive = editor.isActive('link');
		return isActive;
	}, [editor]);

	const handleEdit = useCallback(() => {
		setShowEdit(true);
	}, []);

	const onSetLink = useCallback(
		(url: string, openInNewTab?: boolean) => {
			editor
				.chain()
				.focus()
				.extendMarkRange('link')
				.setLink({ href: url, target: openInNewTab ? '_blank' : '' })
				.run();
			setShowEdit(false);
		},
		[editor]
	);

	const onUnsetLink = useCallback(() => {
		editor.chain().focus().extendMarkRange('link').unsetLink().run();
		setShowEdit(false);
		return null;
	}, [editor]);

	return (
		<BaseBubbleMenu
			editor={editor}
			pluginKey="textMenu"
			shouldShow={shouldShow}
			updateDelay={0}
			tippyOptions={{
				popperOptions: {
					modifiers: [{ name: 'flip', enabled: false }]
				},
				appendTo: () => {
					return appendTo?.current;
				},
				onHidden: () => {
					setShowEdit(false);
				}
			}}>
			{showEdit ? (
				<div
					className={cn(
						'z-50 w-fit rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
					)}>
					<LinkEditorPanel initialUrl={link} initialOpenInNewTab={target === '_blank'} onSetLink={onSetLink} />
				</div>
			) : (
				<LinkPreviewPanel url={link} onClear={onUnsetLink} onEdit={handleEdit} />
			)}
		</BaseBubbleMenu>
	);
};

export default LinkMenu;
