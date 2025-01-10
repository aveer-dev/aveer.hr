import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react';
import React, { useCallback } from 'react';
import * as PopoverMenu from '@/components/tiptap/components/PopoverMenu';

import isColumnGripSelected from './utils';
import { Toolbar } from '@/components/tiptap/components/Toolbar';
import { Icon } from '@/components/tiptap/components/Icon';
import { MenuProps, ShouldShowProps } from '@/components/tiptap/components/menus/types';

export const TableColumnMenu = React.memo(({ editor, appendTo }: MenuProps) => {
	const shouldShow = useCallback(
		({ view, state, from }: ShouldShowProps) => {
			if (!state) {
				return false;
			}

			return isColumnGripSelected({ editor, view, state, from: from || 0 });
		},
		[editor]
	);

	const onAddColumnBefore = useCallback(() => {
		editor.chain().focus().addColumnBefore().run();
	}, [editor]);

	const onAddColumnAfter = useCallback(() => {
		editor.chain().focus().addColumnAfter().run();
	}, [editor]);

	const onDeleteColumn = useCallback(() => {
		editor.chain().focus().deleteColumn().run();
	}, [editor]);

	return (
		<BaseBubbleMenu
			editor={editor}
			pluginKey="tableColumnMenu"
			updateDelay={0}
			tippyOptions={{
				appendTo: () => {
					return appendTo?.current;
				},
				placement: 'right',
				offset: [0, -160],
				popperOptions: {
					modifiers: [{ name: 'flip', enabled: false }]
				}
			}}
			shouldShow={shouldShow}>
			<Toolbar.Wrapper isVertical>
				<PopoverMenu.Item iconComponent={<Icon name="ArrowLeftToLine" />} close={false} label="Add column before" onClick={onAddColumnBefore} />
				<PopoverMenu.Item iconComponent={<Icon name="ArrowRightToLine" />} close={false} label="Add column after" onClick={onAddColumnAfter} />
				<PopoverMenu.Item icon="Trash" close={false} label="Delete column" onClick={onDeleteColumn} />
			</Toolbar.Wrapper>
		</BaseBubbleMenu>
	);
});

TableColumnMenu.displayName = 'TableColumnMenu';

export default TableColumnMenu;
