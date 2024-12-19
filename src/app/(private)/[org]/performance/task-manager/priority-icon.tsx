import { cn } from '@/lib/utils';

export const PriorityIcon = ({ state, className }: { state: 'high' | 'medium' | 'low'; className?: string }) => {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
			<path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M8 17L8 14" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
			{(state == 'medium' || state == 'high') && <path d="M12 17L12 10" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />}
			{state == 'high' && <path d="M16 17L16 7" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />}
		</svg>
	);
};
