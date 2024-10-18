import { Boardings } from '@/components/contract/boarding';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, team:teams!contracts_team_fkey(name, id), profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('id', params.contract)
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	const manager = (await supabase.from('managers').select().match({ org: params.org, person: params.contract, team: data.team?.id })).data;

	return <Boardings contract={data} org={params.org} onboardingId={data.onboarding} offboardingId={data.offboarding} reviewType={manager?.length ? 'manager' : 'employee'} />;
}
