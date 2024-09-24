import { createClient } from '@/utils/supabase/server';
import { TeamMember } from './team-member-dialog';

interface props {
	org: string;
	name: string;
	team: number;
	contractId: number;
}

export const Teams = async ({ org, team, contractId, name }: props) => {
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
				<ul className="border-t pt-6">
					{filteredTeam.map(person => (
						<li key={person.id}>
							<TeamMember isManager={!!managers?.find(manager => manager.person == person.id)} person={person as any} />
						</li>
					))}
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
