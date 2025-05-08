import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Database } from '@/type/database.types';
import { addDays, differenceInDays, parseISO } from 'date-fns';
import { Info } from 'lucide-react';

export const ContractStatus = ({ state, start_date, end_date, probation_days }: { state: Database['public']['Enums']['contract_state']; start_date: string; end_date?: string | null; probation_days?: number | null }) => {
	const now = new Date();

	let probationDaysLeft = null;

	if (probation_days) {
		const startDate = parseISO(start_date);
		const probationEndDate = addDays(startDate, probation_days);
		probationDaysLeft = differenceInDays(probationEndDate, new Date());
	}

	const getState = (): { state: string; description: string } => {
		if (state == 'signed' && new Date(start_date) <= now) return { state: 'active', description: 'Contract has been signed by required parties and currently in effect' };

		if (state.includes('wait') && new Date(start_date) <= now) return { state: 'pending', description: 'Contract start date has passed and parties are yet to sign' };

		if (state == 'scheduled termination' && end_date && new Date(end_date) <= now) return { state: 'terminated', description: 'Contract has been terminated and no longer in effect' };

		if (state == 'awaiting org signature') return { state: 'awaiting signature', description: 'Contract awaiting signature from company' };

		if (state == 'awaiting signature') return { state: 'awaiting signature', description: 'Contract awaiting signature from employee' };

		if (state == 'awaiting signatures') return { state: 'awaiting signatures', description: 'Contract awaiting signature from company and employee' };

		return { state: state, description: state };
	};

	const stateData = getState();

	return (
		<>
			<Badge className="gap-2 whitespace-nowrap py-1 font-light" variant={stateData.state.includes('term') ? 'secondary-destructive' : stateData.state == 'active' || stateData.state == 'signed' ? 'secondary-success' : 'secondary'}>
				{stateData.state}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Info size={12} className="stroke-1" />
							</div>
						</TooltipTrigger>
						<TooltipContent className="max-w-52">
							<p className="text-wrap text-xs font-thin">{stateData.description}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</Badge>

			{!!probationDaysLeft && probationDaysLeft > 0 && state == 'signed' && (
				<Badge variant="secondary-warn" className="ml-1 text-xs">
					Probation: {probationDaysLeft} days left
				</Badge>
			)}
		</>
	);
};
