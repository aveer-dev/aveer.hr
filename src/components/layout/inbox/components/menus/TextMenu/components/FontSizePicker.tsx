import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Surface } from '../../../Surface';
import { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownButton } from '../../../dropdown';
import { Button } from '@/components/ui/button';

const FONT_SIZES = [
	{ label: 'Smaller', value: '12px' },
	{ label: 'Small', value: '14px' },
	{ label: 'Medium', value: '' },
	{ label: 'Large', value: '18px' },
	{ label: 'Extra Large', value: '24px' }
];

export type FontSizePickerProps = {
	onChange: (value: string) => void; // eslint-disable-line no-unused-vars
	value: string;
};

export const FontSizePicker = ({ onChange, value }: FontSizePickerProps) => {
	const currentValue = FONT_SIZES.find(size => size.value === value);
	const currentSizeLabel = currentValue?.label.split(' ')[0] || 'Medium';

	const selectSize = useCallback((size: string) => () => onChange(size), [onChange]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant={!!currentValue?.value ? 'secondary' : 'ghost'} className="h-8 justify-between gap-px px-2" tooltip="Font size">
					<span className="w-14 text-left">{currentSizeLabel}</span>
					<ChevronDown size={10} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent asChild>
				<Surface className="flex flex-col gap-1 px-2 py-4">
					{FONT_SIZES.map(size => (
						<DropdownButton isActive={value === size.value} onClick={selectSize(size.value)} key={`${size.label}_${size.value}`}>
							<span style={{ fontSize: size.value }}>{size.label}</span>
						</DropdownButton>
					))}
				</Surface>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
