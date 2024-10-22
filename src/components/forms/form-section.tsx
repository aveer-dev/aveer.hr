import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

export const FormSection = ({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
	return (
		<div {...props} className={cn('grid gap-x-4 gap-y-12 border-t border-t-border py-8 md:grid-cols-2 md:py-16', props.className)}>
			{children}
		</div>
	);
};

export const FormSectionDescription = ({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
	return (
		<div {...props} className={cn('grid h-fit gap-1', props.className)}>
			{children}
		</div>
	);
};

export const InputsContainer = ({ children }: { children: ReactNode }) => {
	return <div className="space-y-8">{children}</div>;
};
