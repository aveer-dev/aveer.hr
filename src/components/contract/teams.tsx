import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface props {
	org: string;
	team: number;
}

export const Teams = async ({ org, team }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('contracts').select('*, level:employee_levels!contracts_level_fkey(*), profile:profiles!contracts_profile_fkey(*)').match({ org, team });

	if (error) return error.message;

	return (
		<section className="mt-6 w-full">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="flex items-center justify-between text-xl font-bold">Team</h2>
			</div>

			<div className="">
				<ul className="space-y-8">
					{data.map(person => (
						<li key={person.id}>
							<Link className="group rounded-md outline-none" href={`./${person.id}`}>
								<Card className="flex items-center justify-between border-none p-3 transition-all duration-500 group-hover:bg-accent/80 group-focus:bg-accent/80 group-focus-visible:bg-accent/80">
									<div className="space-y-2">
										<h2 className="text-xs">
											{person.profile?.first_name} {person.profile?.last_name}
											{(person.level || person.level_name) && (
												<Badge className="ml-2 py-px text-[10px]" variant={'secondary'}>
													{person.level?.level || person.level_name}
												</Badge>
											)}
										</h2>
										<p className="text-xs text-muted-foreground">{person.job_title}</p>
									</div>

									<ChevronRight size={12} />
								</Card>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};
