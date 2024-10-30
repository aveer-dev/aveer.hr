import { createClient } from '@/utils/supabase/server';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface props {
	org: string;
	name: string;
	team: number;
	contractId: number;
	currentUser: 'profile' | 'org';
	isManager: boolean;
}

export const Teams = async ({ org, team, contractId, name, currentUser, isManager }: props) => {
	const supabase = createClient();

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
					<h2 className="text-lg font-semibold text-support">Team</h2>
					<p className="text-xs font-light text-muted-foreground">Team name: {name}</p>
				</div>

				{filteredTeam.length > 0 && (
					<ul className="mt-6 space-y-4">
						{filteredTeam.map(person => (
							<li key={person.id}>
								<Link href={contractId == person.id ? '' : `./${person.id}`} className="flex items-center justify-between rounded-md bg-muted/60 p-4 transition-colors hover:bg-muted">
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

									{contractId !== person.id && <ArrowUpRight size={12} />}
								</Link>
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
					<h2 className="text-lg font-semibold text-support">Direct reports</h2>
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
										<Link href={contractId == person.id ? '' : `./${person.id}`} className="flex items-center justify-between rounded-md bg-muted/60 p-4 transition-colors hover:bg-muted">
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
														<Badge className="py-px text-[10px]" variant={'outline'}>
															manager
														</Badge>
													)}
												</div>

												<p className="text-xs text-muted-foreground">{person.job_title}</p>
											</div>

											<ArrowUpRight size={12} />
										</Link>
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
