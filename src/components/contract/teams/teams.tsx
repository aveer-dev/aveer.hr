import { createClient } from '@/utils/supabase/server';
import { TeamMember } from './team-member-dialog';

interface props {
	org: string;
	team: number;
	contractId: number;
}

export const Teams = async ({ org, team, contractId }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('contracts').select('*, level:employee_levels!contracts_level_fkey(*), profile:profiles!contracts_profile_fkey(*)').match({ org, team, status: 'signed' });

	if (error) return error.message;
	const filteredTeam = data.filter(contract => contract.id !== contractId);

	return (
		<section className="mt-6 w-full">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="flex items-center justify-between text-xl font-bold">Team</h2>
			</div>

			<div className="">
				<ul className="">
					{filteredTeam.map(person => (
						<li key={person.id}>
							<TeamMember person={person as any} />
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};
