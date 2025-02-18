import { Teams } from '@/components/contract/teams';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { isPast } from 'date-fns';
import { Link, Undo2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const [{ data, error }, { data: orgSettings }] = await Promise.all([
		await supabase
			.from('contracts')
			.select(
				'*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
			)
			.eq('id', Number(params.contract))
			.single(),
		await supabase.from('org_settings').select().match({ org: params.org })
	]);

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	if (data?.status !== 'signed') redirect('./home');

	const manager = (await supabase.from('managers').select().match({ org: params.org, person: params.contract, team: data.team?.id })).data;

	return data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <Teams orgSettings={orgSettings} currentUser={!!manager?.length ? 'manager' : 'profile'} name={data.team.name} contractId={data.id} org={params.org} team={data.team.id} />;
}
