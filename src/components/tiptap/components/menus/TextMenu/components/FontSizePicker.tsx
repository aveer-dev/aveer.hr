import { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownButton } from '../../../dropdown';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const FONT_SIZES = [
	{ label: 'Smaller', value: '12px' },
	{ label: 'Small', value: '14px' },
	{ label: 'Medium', value: '16px' },
	{ label: 'Large', value: '18px' },
	{ label: 'Extra Large', value: '24px' }
];

export type FontSizePickerProps = {
	onChange: (value: string) => void;
	value: string;
};

export const FontSizePicker = ({ onChange, value }: FontSizePickerProps) => {
	const currentValue = FONT_SIZES.find(size => size.value === value);
	const currentSizeLabel = currentValue?.label.split(' ')[0] || 'Medium';

	const selectSize = useCallback((size: string) => () => onChange(size), [onChange]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant={!!currentValue?.value ? 'secondary' : 'ghost'} className="h-8 justify-between gap-px px-2" tooltip="Font size">
					<span className="w-14 text-left">{currentSizeLabel}</span>
					<ChevronDown size={10} />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-36 p-2" align="start" alignOffset={-4}>
				{FONT_SIZES.map(size => (
					<DropdownButton isActive={value === size.value} onClick={selectSize(size.value)} key={`${size.label}_${size.value}`}>
						<span>{size.label}</span>
					</DropdownButton>
				))}
			</PopoverContent>
		</Popover>
	);
};
