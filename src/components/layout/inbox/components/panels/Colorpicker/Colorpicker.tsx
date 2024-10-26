import { useCallback, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ColorButton } from './ColorButton';
import { Toolbar } from '../../Toolbar';
import { themeColors } from '../../../lib/constants';
import { Undo } from 'lucide-react';
import { Input } from '@/components/ui/input';

export type ColorPickerProps = {
	color?: string;
	onChange?: (color: string) => void;
	onClear?: () => void;
};

export const ColorPicker = ({ color, onChange, onClear }: ColorPickerProps) => {
	const [colorInputValue, setColorInputValue] = useState(color || '');

	const handleColorUpdate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setColorInputValue(event.target.value);
	}, []);

	const handleColorChange = useCallback(() => {
		const isCorrectColor = /^#([0-9A-F]{3}){1,2}$/i.test(colorInputValue);

		if (!isCorrectColor) {
			if (onChange) {
				onChange('');
			}

			return;
		}

		if (onChange) {
			onChange(colorInputValue);
		}
	}, [colorInputValue, onChange]);

	return (
		<div className="flex flex-col gap-2">
			<HexColorPicker className="w-full" color={color || ''} onChange={onChange} />

			<Input value={colorInputValue} onChange={handleColorUpdate} onBlur={handleColorChange} placeholder="#000000" />

			<div className="flex max-w-[15rem] flex-wrap items-center gap-px">
				{themeColors.map((currentColor: any) => (
					<ColorButton active={currentColor === color} color={currentColor} key={currentColor} onColorChange={onChange} />
				))}

				<Toolbar.Button tooltip="Reset color to default" onClick={onClear}>
					<Undo size={14} />
				</Toolbar.Button>
			</div>
		</div>
	);
};
