import { cn } from '@/lib/utils';
import { Badge } from './badge';

export const ApplicantBadge = ({ stage }: { stage: string }) => {
	return (
		<Badge
			variant={'secondary'}
			className={cn(
				'px-3 py-[2px] text-[10px] capitalize',
				stage == 'applicant' && 'bg-secondary',
				stage == 'review' && 'bg-blue-100 hover:bg-blue-100',
				stage == 'interview' && 'bg-violet-100 hover:bg-violet-100',
				stage == 'offer' && 'bg-indigo-100 hover:bg-indigo-100',
				stage == 'hired' && 'bg-green-100 hover:bg-green-100'
			)}>
			{stage || 'Select stage...'}
		</Badge>
	);
};
