import { createClient } from '@/utils/supabase/server';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TeamMember } from './team-member-dialog';
import { Tables } from '@/type/database.types';

interface props {
	org: string;
	name: string;
	team: number;
	contractId: number;
	currentUser: 'profile' | 'org' | 'manager';
	orgSettings: Tables<'org_settings'> | null;
}

export const Teams = async ({ org, team, contractId, name, currentUser, orgSettings }: props) => {
	const supabase = await createClient();

	const [{ data, error }, { data: managers }, { data: directReports, error: directReportsError }] = await Promise.all([
		await supabase.from('contracts').select('*, level:employee_levels!contracts_level_fkey(*), profile:profiles!contracts_profile_fkey(*)').match({ org, team, status: 'signed' }),
		await supabase.from('managers').select().match({ team }),
		await supabase.from('contracts').select('*, level:employee_levels!contracts_level_fkey(*), profile:profiles!contracts_profile_fkey(*)').match({ org, status: 'signed', direct_report: contractId })
	]);

	if (error) return error.message;
	const filteredTeam = data;

	return (
		<>
			<section className="mt-6 w-full">
				<div className="space-y-1">
					<h2 className="text-base font-medium text-support">Team</h2>
					<p className="text-xs font-light text-muted-foreground">Team name: {name}</p>
				</div>

				{filteredTeam.length > 0 && (
					<ul className="mt-4 space-y-4">
						{filteredTeam.map(person => (
							<li key={person.id}>
								{currentUser === 'org' && (
									<Link href={contractId == person.id ? '' : `./${person.id}`} className="flex items-center justify-between rounded-md border bg-muted/60 p-4 transition-colors hover:bg-muted">
										<TeamMemberItem person={person} managers={managers} contractId={contractId} currentUser={currentUser} />
									</Link>
								)}

								{contractId !== person.id && currentUser !== 'org' && (
									<TeamMember person={person as any} manager={managers} signatureType={currentUser} orgSettings={currentUser == 'manager' ? orgSettings : null} org={org}>
										<TeamMemberItem person={person} managers={managers} contractId={contractId} currentUser={currentUser} />
									</TeamMember>
								)}

								{contractId == person.id && currentUser !== 'org' && (
									<div className="flex items-center justify-between rounded-md border bg-muted/60 p-4 transition-colors hover:bg-muted">
										<TeamMemberItem person={person} managers={managers} contractId={contractId} currentUser={currentUser} />
									</div>
								)}
							</li>
						))}
					</ul>
				)}

				{filteredTeam.length == 0 && (
					<div className="mt-6 flex h-32 w-full items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
						<p>You do not have any team member</p>
					</div>
				)}
			</section>

			<section className="mt-16 w-full">
				<div className="space-y-1">
					<h2 className="text-base font-medium text-support">Direct reports</h2>
					<p className="text-xs font-light text-muted-foreground">People reporting directly to you</p>
				</div>

				{(!directReports || directReportsError) && (
					<div className="flex h-52 items-center justify-center rounded-md text-xs text-muted-foreground">
						<p>{directReportsError.message || 'Unable to fetch direct reports'}</p>
					</div>
				)}

				{!!directReports && (
					<>
						{directReports.length > 0 && (
							<ul className="mt-6 space-y-4">
								{directReports.map(person => (
									<li key={person.id}>
										{currentUser === 'org' && (
											<Link href={contractId == person.id ? '' : `./${person.id}`} className="flex items-center justify-between rounded-md border bg-muted/60 p-4 transition-colors hover:bg-muted">
												<TeamMemberItem person={person} managers={managers} contractId={contractId} currentUser={currentUser} />
											</Link>
										)}

										{currentUser !== 'org' && (
											<TeamMember person={person as any} orgSettings={currentUser == 'manager' ? orgSettings : null} signatureType={currentUser} org={org}>
												<TeamMemberItem person={person} managers={managers} contractId={contractId} currentUser={currentUser} />
											</TeamMember>
										)}
									</li>
								))}
							</ul>
						)}

						{directReports.length == 0 && (
							<div className="mt-6 flex h-32 w-full items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
								<p>You do not have any direct reports</p>
							</div>
						)}
					</>
				)}
			</section>
		</>
	);
};

const TeamMemberItem = ({ person, managers, contractId, currentUser }: { person: Tables<'contracts'> | any; managers: Tables<'managers'>[] | null; contractId: number; currentUser: 'profile' | 'org' | 'manager' }) => {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<h2 className="text-xs">
					{(person.profile as any)?.first_name} {(person.profile as any)?.last_name}
				</h2>
				{(person.level || person.level_name) && (
					<Badge className="py-px text-[10px]" variant={'outline'}>
						{(person.level as any)?.level || person.level_name}
					</Badge>
				)}
				{!!managers?.find(manager => manager.person == person.id) && (
					<Badge className="py-px text-[10px]" variant={'outline'}>
						manager
					</Badge>
				)}
				{contractId == person.id && currentUser !== 'org' && (
					<Badge className="py-px text-[10px]" variant={'outline'}>
						You
					</Badge>
				)}
			</div>

			<p className="text-xs text-muted-foreground">{person.job_title}</p>
		</div>
	);
};
