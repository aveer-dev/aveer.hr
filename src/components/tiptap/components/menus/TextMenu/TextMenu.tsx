import { Toolbar } from '../../Toolbar';
import { useTextmenuCommands } from './hooks/useTextmenuCommands';
import { useTextmenuStates } from './hooks/useTextmenuStates';
import { BubbleMenu, Editor } from '@tiptap/react';
import { memo } from 'react';
import { FontSizePicker } from './components/FontSizePicker';
import { EditLinkPopover } from './components/EditLinkPopover';
import { Bold, Code, Italic, Underline } from 'lucide-react';
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
		<>
			<MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || '14px'} />

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
		</>
	);
};

export const TextMenuBubble = ({ editor }: TextMenuProps) => {
	const states = useTextmenuStates(editor);

	return (
		<BubbleMenu
			tippyOptions={{
				popperOptions: {
					placement: 'bottom-end',
					modifiers: [
						{
							name: 'preventOverflow',
							options: {
								boundary: 'viewport',
								padding: 8
							}
						},
						{
							name: 'flip',
							options: {
								fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end']
							}
						}
					]
				},
				maxWidth: 'calc(100vw - 16px)'
			}}
			editor={editor}
			pluginKey="textMenu"
			shouldShow={states.shouldShow}
			updateDelay={100}>
			<Toolbar.Wrapper>
				<TextMenu editor={editor} />
			</Toolbar.Wrapper>
		</BubbleMenu>
	);
};
