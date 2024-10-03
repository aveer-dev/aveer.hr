import { createClient } from '@/utils/supabase/server';
import { TeamMember } from './team-member-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TeamMemberAppraisalsDialog } from './team-member-appraisals-dialog';
interface props {
	org: string;
	name: string;
	team: number;
	contractId: number;
	currentUser: 'profile' | 'org';
}

export const Teams = async ({ org, team, contractId, name, currentUser }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('contracts').select('*, level:employee_levels!contracts_level_fkey(*), profile:profiles!contracts_profile_fkey(*)').match({ org, team, status: 'signed' });
	const { data: managers } = await supabase.from('managers').select().match({ team });
	if (error) return error.message;
	const filteredTeam = data.filter(contract => contract.id !== contractId);

	return (
		<section className="mt-6 w-full">
			<div className="mb-4">
				<h2 className="flex items-center justify-between text-xl font-bold">Team</h2>
				<p className="text-xs font-light text-muted-foreground">Team name: {name}</p>
			</div>

			{filteredTeam.length > 0 && (
				<ul className="mt-6">
					{filteredTeam.map(person => (
						<li key={person.id} className="flex items-center justify-between border-t py-6">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<h2 className="text-xs">
										{person.profile?.first_name} {person.profile?.last_name}
									</h2>
									{(person.level || person.level_name) && (
										<Badge className="py-px text-[10px]" variant={'outline'}>
											{person.level?.level || person.level_name}
										</Badge>
									)}
									{!!managers?.find(manager => manager.person == person.id) && (
										<Badge className="ml-2 py-px text-[10px]" variant={'outline'}>
											manager
										</Badge>
									)}
								</div>
								<p className="text-xs text-muted-foreground">{person.job_title}</p>
							</div>

							<div className="flex items-center gap-2">
								{!!managers?.length && currentUser !== 'org' && <TeamMemberAppraisalsDialog managerContract={contractId} org={org} contract={person} />}
								<TeamMember person={person as any} />
							</div>
						</li>
					))}

					<Separator />
				</ul>
			)}

			{filteredTeam.length == 0 && (
				<div className="flex h-32 w-full items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
					<p>You do not have any team member</p>
				</div>
			)}
		</section>
	);
};
