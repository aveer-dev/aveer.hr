import { Teams } from '@/components/contract/teams';
import { createClient } from '@/utils/supabase/server';
import { isPast } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const [{ data, error }, { data: orgSettings }] = await Promise.all([
		await supabase
			.from('contracts')
			.select(
				'*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
			)
			.eq('id', params.contract)
			.single(),
		await supabase.from('org_settings').select().match({ org: params.org })
	]);

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (data.status !== 'signed') redirect('./home');

	const manager = (await supabase.from('managers').select().match({ org: params.org, person: params.contract, team: data.team?.id })).data;

	return data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <Teams orgSettings={orgSettings} currentUser={!!manager?.length ? 'manager' : 'profile'} name={data.team.name} contractId={data.id} org={params.org} team={data.team.id} />;
}
