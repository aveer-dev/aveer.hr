import { MenuProps, ShouldShowProps } from '@/components/tiptap/components/menus/types';
import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react';
import React, { useCallback } from 'react';

import { isRowGripSelected } from './utils';
import { Toolbar } from '@/components/tiptap/components/Toolbar';
import { Icon } from '@/components/tiptap/components/Icon';

import * as PopoverMenu from '@/components/tiptap/components/PopoverMenu';

export const TableRowMenu = React.memo(({ editor, appendTo }: MenuProps) => {
	const shouldShow = useCallback(
		({ view, state, from }: ShouldShowProps) => {
			if (!state || !from) {
				return false;
			}

			return isRowGripSelected({ editor, view, state, from });
		},
		[editor]
	);

	const onAddRowBefore = useCallback(() => {
		editor.chain().focus().addRowBefore().run();
	}, [editor]);

	const onAddRowAfter = useCallback(() => {
		editor.chain().focus().addRowAfter().run();
	}, [editor]);

	const onDeleteRow = useCallback(() => {
		editor.chain().focus().deleteRow().run();
	}, [editor]);

	return (
		<BaseBubbleMenu
			editor={editor}
			pluginKey="tableRowMenu"
			updateDelay={0}
			tippyOptions={{
				appendTo: () => {
					return appendTo?.current;
				},
				placement: 'bottom',
				offset: [-400, 0],
				popperOptions: {
					modifiers: [{ name: 'flip', enabled: false }]
				}
			}}
			shouldShow={shouldShow}>
			<Toolbar.Wrapper isVertical>
				<PopoverMenu.Item iconComponent={<Icon name="ArrowUpToLine" size={12} />} close={false} label="Add row before" onClick={onAddRowBefore} />
				<PopoverMenu.Item iconComponent={<Icon name="ArrowDownToLine" size={12} />} close={false} label="Add row after" onClick={onAddRowAfter} />
				<PopoverMenu.Item icon="Trash" close={false} label="Delete row" onClick={onDeleteRow} />
			</Toolbar.Wrapper>
		</BaseBubbleMenu>
	);
});

TableRowMenu.displayName = 'TableRowMenu';

export default TableRowMenu;
