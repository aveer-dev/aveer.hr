import { Toolbar } from '../../Toolbar';
import { useTextmenuCommands } from './hooks/useTextmenuCommands';
import { useTextmenuStates } from './hooks/useTextmenuStates';
import { Editor } from '@tiptap/react';
import { memo } from 'react';
import { FontSizePicker } from './components/FontSizePicker';
import { EditLinkPopover } from './components/EditLinkPopover';
import { Bold, Code, Italic, Underline } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HighlightPopover } from './components/HighlightPopover';
import { TextColorPopover } from './components/TextColor';
import { AlignmentPopover } from './components/AlignmentPopover';

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button);
const MemoFontSizePicker = memo(FontSizePicker);

export type TextMenuProps = {
	editor: Editor;
};

export const TextMenu = ({ editor }: TextMenuProps) => {
	const commands = useTextmenuCommands(editor);
	const states = useTextmenuStates(editor);

	return (
		<div className="mx-auto flex w-fit gap-1 p-1">
			<MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} />

			<MemoButton tooltip="Bold" tooltipShortcut={['Mod', 'B']} onClick={commands.onBold} active={states.isBold}>
				<Bold size={12} />
			</MemoButton>
			<MemoButton tooltip="Italic" tooltipShortcut={['Mod', 'I']} onClick={commands.onItalic} active={states.isItalic}>
				<Italic size={12} />
			</MemoButton>
			<MemoButton tooltip="Underline" tooltipShortcut={['Mod', 'U']} onClick={commands.onUnderline} active={states.isUnderline}>
				<Underline size={12} />
			</MemoButton>
			<MemoButton tooltip="Code" tooltipShortcut={['Mod', 'E']} onClick={commands.onCode} active={states.isCode}>
				<Code size={12} />
			</MemoButton>

			<EditLinkPopover onSetLink={commands.onLink} />

			<HighlightPopover editor={editor} />

			<TextColorPopover editor={editor} />

			<AlignmentPopover editor={editor} />
		</div>
	);
};
