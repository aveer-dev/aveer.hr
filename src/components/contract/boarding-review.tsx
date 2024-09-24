import { createClient } from '@/utils/supabase/server';
import { ChevronRight } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { Separator } from '@/components/ui/separator';
import { BoardingReview } from './boarding/boarding-review';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface props {
	org: string;
	contract: Tables<'contracts'>;
	manager?: Tables<'managers'> | null;
}

export const BoardingsReview = async ({ org, contract, manager }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('contract_check_list').select('*, contract:contracts!contract_check_list_contract_fkey(id, job_title, team, profile:profiles!contracts_profile_fkey(first_name, last_name, id))').eq('org', org);

	if (error) return error.message;

	/* if current user is a manager, check if it's current user own boarding,
	 * then check if it's for the team the current user is the manager of or the person is an independent reviewer
	 *
	 * else, just check if the person is an independent reviewer */
	const filtereddata = data?.filter(boarding => {
		const levels: any[] = boarding.levels;

		return manager ? manager.person !== boarding.contract.id && (boarding.contract.team == contract.team || levels.find(level => level.id == contract.id)) : levels.find(level => level.id == contract.id);
	});

	return (
		<section className="mt-20 w-full">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center justify-between text-lg font-medium">On/Off boarding review</h2>
			</div>

			<div className="">
				<Separator className="mb-8 mt-2" />

				{filtereddata.length > 0 && (
					<ul className="space-y-10">
						{filtereddata.map(boarding => (
							<li key={boarding.id}>
								<BoardingReview data={boarding as any} contractId={contract.id} className="w-full text-left" reviewType={manager ? 'manager' : 'employee'}>
									<Button variant={'outline'} className="flex h-fit w-full items-center justify-between px-3 py-4 text-left">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<h2 className="text-xs">
													{boarding?.contract?.profile?.first_name} {boarding?.contract?.profile?.last_name}
												</h2>

												<Badge className="h-5" variant={boarding.state == 'approved' ? 'secondary-success' : boarding.state == 'pending' ? 'secondary-warn' : 'outline'}>
													{boarding.state}
												</Badge>
											</div>

											<p className="text-xs text-muted-foreground">{boarding.contract.job_title}</p>
										</div>

										<ChevronRight size={12} />
									</Button>
								</BoardingReview>
							</li>
						))}
					</ul>
				)}

				{filtereddata.length == 0 && (
					<div className="flex min-h-40 items-center justify-center rounded-md bg-accent/50 text-xs text-muted-foreground">
						<p>You do not have any boardings to review</p>
					</div>
				)}
			</div>
		</section>
	);
};
