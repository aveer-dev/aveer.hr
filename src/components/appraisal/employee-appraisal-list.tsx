import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';
import { Separator } from '../ui/separator';
import { AppraisalCycleCard } from './appraisal-cycle-card';

interface Props {
	org: string;
	contract: Tables<'contracts'>;
}

export const EmployeeAppraisalList = async ({ org, contract }: Props) => {
	const supabase = await createClient();

	// Get appraisal cycles where employee's contract start date is before appraisal start date
	const { data: appraisalCycles } = await supabase
		.from('appraisal_cycles')
		.select('*')
		.eq('org', org)
		.gte('start_date', contract.start_date || new Date().toISOString())
		.order('start_date', { ascending: false });

	if (!appraisalCycles || appraisalCycles.length === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No appraisal cycles available.</p>
			</div>
		);
	}

	// Get appraisal answers for all cycles
	const [{ data: teamMembers }, { data: manager }, { data: appraisalAnswers }, { data: teams }] = await Promise.all([
		supabase
			.from('contracts')
			.select('*, profile:profiles!contracts_profile_fkey(first_name, last_name)')
			.match({
				org,
				team: (contract?.team as any)?.id || contract?.team,
				status: 'signed'
			}),
		supabase.from('managers').select('*').eq('org', org).eq('person', contract.id).single(),
		supabase
			.from('appraisal_answers')
			.select('*')
			.eq('org', org)
			.eq('contract_id', contract.id)
			.in(
				'appraisal_cycle_id',
				appraisalCycles.map(cycle => cycle.id)
			),
		supabase.from('teams').select('*').match({ org })
	]);

	const activeAppraisals = appraisalCycles.filter(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date());

	const pastAppraisals = appraisalCycles.filter(cycle => new Date(cycle.end_date) < new Date());

	return (
		<div className="space-y-12">
			{/* Active Appraisals Section */}
			{activeAppraisals.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit whitespace-nowrap pr-4 text-sm font-medium text-muted-foreground">Active Appraisals</h3>
						<Separator className="w-[calc(100%-150px)]" />
					</div>

					{activeAppraisals.map(cycle => (
						<AppraisalCycleCard key={cycle.id} org={org} cycle={cycle} answer={appraisalAnswers?.find(a => a.appraisal_cycle_id === cycle.id)} status="active" />
					))}
				</div>
			)}

			{/* Past Appraisals Section */}
			{pastAppraisals.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit whitespace-nowrap pr-4 text-sm font-medium text-muted-foreground">Past Appraisals</h3>
						<Separator className="w-[calc(100%-150px)]" />
					</div>

					{pastAppraisals.map(cycle => (
						<AppraisalCycleCard key={cycle.id} org={org} cycle={cycle} answer={appraisalAnswers?.find(a => a.appraisal_cycle_id === cycle.id)} status="past" />
					))}
				</div>
			)}
		</div>
	);
};
