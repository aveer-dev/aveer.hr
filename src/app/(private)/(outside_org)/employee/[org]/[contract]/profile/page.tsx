import { Profile } from '@/components/contract/profile/profile';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain)')
		.eq('id', Number(params.contract))
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	return <Profile type={'profile'} data={data.profile as any} />;
}
