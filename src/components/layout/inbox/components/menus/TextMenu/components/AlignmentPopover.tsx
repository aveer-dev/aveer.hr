import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Editor } from '@tiptap/react';
import { EllipsisVertical } from 'lucide-react';
import { useTextmenuCommands } from '../hooks/useTextmenuCommands';
import { useTextmenuStates } from '../hooks/useTextmenuStates';
import { Toolbar } from '../../../Toolbar';
import { memo, useState } from 'react';
import { Icon } from '../../../Icon';

export const AlignmentPopover = ({ editor }: { editor: Editor }) => {
	const states = useTextmenuStates(editor);
	const commands = useTextmenuCommands(editor);
	const [isOpen, toggleOpenState] = useState(false);
	const MemoButton = memo(Toolbar.Button);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			<PopoverTrigger asChild>
				<Toolbar.Button variant={isOpen ? 'secondary' : 'ghost'} tooltip="More options">
					<EllipsisVertical size={12} />
				</Toolbar.Button>
			</PopoverTrigger>

			<PopoverContent side="top" align="end" sideOffset={8} className="flex w-fit items-center gap-1 p-1 shadow-sm" onOpenAutoFocus={event => event.preventDefault()}>
				<MemoButton tooltip="Strikehrough" tooltipShortcut={['Mod', 'Shift', 'S']} onClick={commands.onStrike} active={states.isStrike}>
					<Icon name="Strikethrough" size={12} />
				</MemoButton>
				<MemoButton tooltip="Subscript" tooltipShortcut={['Mod', '.']} onClick={commands.onSubscript} active={states.isSubscript}>
					<Icon name="Subscript" size={12} />
				</MemoButton>
				<MemoButton tooltip="Superscript" tooltipShortcut={['Mod', ',']} onClick={commands.onSuperscript} active={states.isSuperscript}>
					<Icon name="Superscript" size={12} />
				</MemoButton>
				<Toolbar.Divider />
				<MemoButton tooltip="Align left" tooltipShortcut={['Shift', 'Mod', 'L']} onClick={commands.onAlignLeft} active={states.isAlignLeft}>
					<Icon name="AlignLeft" size={12} />
				</MemoButton>
				<MemoButton tooltip="Align center" tooltipShortcut={['Shift', 'Mod', 'E']} onClick={commands.onAlignCenter} active={states.isAlignCenter}>
					<Icon name="AlignCenter" size={12} />
				</MemoButton>
				<MemoButton tooltip="Align right" tooltipShortcut={['Shift', 'Mod', 'R']} onClick={commands.onAlignRight} active={states.isAlignRight}>
					<Icon name="AlignRight" size={12} />
				</MemoButton>
				<MemoButton tooltip="Justify" tooltipShortcut={['Shift', 'Mod', 'J']} onClick={commands.onAlignJustify} active={states.isAlignJustify}>
					<Icon name="AlignJustify" size={12} />
				</MemoButton>
			</PopoverContent>
		</Popover>
	);
};
