import { cn } from '@/lib/utils';
import { icons } from 'lucide-react';
import { memo } from 'react';

export type IconProps = {
	name: keyof typeof icons;
	className?: string;
	strokeWidth?: number;
};

export const Icon = memo(({ name, className, strokeWidth, size }: IconProps & { size?: number }) => {
	const IconComponent = icons[name];

	if (!IconComponent) {
		return null;
	}

	return <IconComponent size={size || 12} className={cn(className)} strokeWidth={strokeWidth || 1.5} />;
});

Icon.displayName = 'Icon';
