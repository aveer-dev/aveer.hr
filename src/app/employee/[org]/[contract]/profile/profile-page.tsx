import { Profile } from '@/components/contract/profile/profile';
import { createClient } from '@/utils/supabase/server';

export const ProfilePageComponent = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { contract } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain)')
		.eq('id', Number(contract))
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	return (
		<div className="mx-auto mt-24 max-w-3xl sm:mt-0">
			<Profile type={'profile'} data={data.profile as any} />
		</div>
	);
};
