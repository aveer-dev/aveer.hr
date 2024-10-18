import { Details } from '@/components/ui/details';
import { createClient } from '@/utils/supabase/server';
import { InfoIcon } from 'lucide-react';

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

	return (
		<section className="grid gap-6">
			<div className="flex w-full items-center justify-between">
				<h1 className="text-lg font-bold">Contract details</h1>
			</div>

			<div className="flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
				<InfoIcon size={12} />
				{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
			</div>

			<div className="space-y-16">
				<Details formType="contract" data={data} isManager={!!(manager && manager?.length > 0)} />
			</div>
		</section>
	);
}
