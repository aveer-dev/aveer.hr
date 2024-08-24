import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

export const FormSection = ({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => {
	return (
		<div {...props} className={cn('grid grid-cols-2 border-t border-t-border py-16', props.className)}>
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
	return <div className="grid gap-8">{children}</div>;
};
