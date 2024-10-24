import { Toolbar } from '@/components/ui/Toolbar';
import { useTextmenuCommands } from './hooks/useTextmenuCommands';
import { useTextmenuStates } from './hooks/useTextmenuStates';
import { BubbleMenu, Editor } from '@tiptap/react';
import { memo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Surface } from '@/components/ui/Surface';
import { ColorPicker } from '@/components/panels';
import { FontSizePicker } from './components/FontSizePicker';
import { EditLinkPopover } from './components/EditLinkPopover';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, EllipsisVertical, Highlighter, Italic, Palette, Strikethrough, Subscript, Superscript, Underline } from 'lucide-react';

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button);
const MemoColorPicker = memo(ColorPicker);
const MemoFontSizePicker = memo(FontSizePicker);

export type TextMenuProps = {
	editor: Editor;
};

export const TextMenu = ({ editor }: TextMenuProps) => {
	const commands = useTextmenuCommands(editor);
	const states = useTextmenuStates(editor);

	return (
		<BubbleMenu
			tippyOptions={{
				popperOptions: {
					placement: 'top-start',
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
				<MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} />
				<Toolbar.Divider />
				<MemoButton tooltip="Bold" tooltipShortcut={['Mod', 'B']} onClick={commands.onBold} active={states.isBold}>
					<Bold size={14} />
				</MemoButton>
				<MemoButton tooltip="Italic" tooltipShortcut={['Mod', 'I']} onClick={commands.onItalic} active={states.isItalic}>
					<Italic size={14} />
				</MemoButton>
				<MemoButton tooltip="Underline" tooltipShortcut={['Mod', 'U']} onClick={commands.onUnderline} active={states.isUnderline}>
					<Underline size={14} />
				</MemoButton>
				<MemoButton tooltip="Strikehrough" tooltipShortcut={['Mod', 'Shift', 'S']} onClick={commands.onStrike} active={states.isStrike}>
					<Strikethrough size={14} />
				</MemoButton>
				<MemoButton tooltip="Code" tooltipShortcut={['Mod', 'E']} onClick={commands.onCode} active={states.isCode}>
					<Code size={14} />
				</MemoButton>
				<EditLinkPopover onSetLink={commands.onLink} />
				<Popover.Root>
					<Popover.Trigger asChild>
						<MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
							<Highlighter size={14} />
						</MemoButton>
					</Popover.Trigger>
					<Popover.Content side="top" sideOffset={8} asChild>
						<Surface className="p-1">
							<MemoColorPicker color={states.currentHighlight} onChange={commands.onChangeHighlight} onClear={commands.onClearHighlight} />
						</Surface>
					</Popover.Content>
				</Popover.Root>
				<Popover.Root>
					<Popover.Trigger asChild>
						<MemoButton active={!!states.currentColor} tooltip="Text color">
							<Palette size={14} />
						</MemoButton>
					</Popover.Trigger>
					<Popover.Content side="top" sideOffset={8} asChild>
						<Surface className="p-1">
							<MemoColorPicker color={states.currentColor} onChange={commands.onChangeColor} onClear={commands.onClearColor} />
						</Surface>
					</Popover.Content>
				</Popover.Root>
				<Popover.Root>
					<Popover.Trigger asChild>
						<MemoButton tooltip="More options">
							<EllipsisVertical size={14} />
						</MemoButton>
					</Popover.Trigger>
					<Popover.Content side="top" asChild>
						<Toolbar.Wrapper>
							<MemoButton tooltip="Subscript" tooltipShortcut={['Mod', '.']} onClick={commands.onSubscript} active={states.isSubscript}>
								<Subscript size={14} />
							</MemoButton>
							<MemoButton tooltip="Superscript" tooltipShortcut={['Mod', ',']} onClick={commands.onSuperscript} active={states.isSuperscript}>
								<Superscript size={14} />
							</MemoButton>
							<Toolbar.Divider />
							<MemoButton tooltip="Align left" tooltipShortcut={['Shift', 'Mod', 'L']} onClick={commands.onAlignLeft} active={states.isAlignLeft}>
								<AlignLeft size={14} />
							</MemoButton>
							<MemoButton tooltip="Align center" tooltipShortcut={['Shift', 'Mod', 'E']} onClick={commands.onAlignCenter} active={states.isAlignCenter}>
								<AlignCenter size={14} />
							</MemoButton>
							<MemoButton tooltip="Align right" tooltipShortcut={['Shift', 'Mod', 'R']} onClick={commands.onAlignRight} active={states.isAlignRight}>
								<AlignRight size={14} />
							</MemoButton>
							<MemoButton tooltip="Justify" tooltipShortcut={['Shift', 'Mod', 'J']} onClick={commands.onAlignJustify} active={states.isAlignJustify}>
								<AlignJustify size={14} />
							</MemoButton>
						</Toolbar.Wrapper>
					</Popover.Content>
				</Popover.Root>
			</Toolbar.Wrapper>
		</BubbleMenu>
	);
};
