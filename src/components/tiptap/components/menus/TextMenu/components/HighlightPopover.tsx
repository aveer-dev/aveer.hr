import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Editor } from '@tiptap/react';
import { Highlighter } from 'lucide-react';
import { useTextmenuCommands } from '../hooks/useTextmenuCommands';
import { useTextmenuStates } from '../hooks/useTextmenuStates';
import { Toolbar } from '../../../Toolbar';
import { memo, useState } from 'react';
import { ColorPicker } from '../../../panels';

export const HighlightPopover = ({ editor }: { editor: Editor }) => {
	const states = useTextmenuStates(editor);
	const commands = useTextmenuCommands(editor);
	const MemoColorPicker = memo(ColorPicker);
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			<PopoverTrigger asChild>
				<Toolbar.Button variant={isOpen ? 'secondary' : 'ghost'} active={!!states.currentHighlight} tooltip="Highlight text">
					<Highlighter size={12} />
				</Toolbar.Button>
			</PopoverTrigger>

			<PopoverContent side="top" align="end" sideOffset={8} className="w-fit shadow-sm">
				<MemoColorPicker color={states.currentHighlight} onChange={commands.onChangeHighlight} onClear={commands.onClearHighlight} />
			</PopoverContent>
		</Popover>
	);
};
