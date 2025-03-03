import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { memo, useCallback, useEffect, useState } from 'react';

export type ImageBlockWidthProps = {
	onChange: (value: number) => void;
	value: number;
};

export const ImageBlockWidth = memo(({ onChange, value }: ImageBlockWidthProps) => {
	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		setCurrentValue(value);
	}, [value]);

	const handleChange = useCallback(
		(value: number[]) => {
			const nextValue = value[0];
			onChange(nextValue);
			setCurrentValue(nextValue);
		},
		[onChange]
	);

	return <Slider value={[currentValue]} max={100} step={1} min={1} className={cn('w-36')} onValueChange={handleChange} />;
});

ImageBlockWidth.displayName = 'ImageBlockWidth';
