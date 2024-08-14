import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegalEntityForm } from '../legal-entity/new/form';
import { SecurityForm } from './profile-security-form';
import { ProfileForm } from './profile-form';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsPage({ params }: { params: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) return <div>Unable to fetch user data</div>;

	const [profileResponse, organisationResponse, LegalEntityResponse] = await Promise.all([
		await supabase.from('profiles').select().eq('id', user?.id).single(),
		await supabase.from('organisations').select().eq('id', params.org_id).single(),
		await supabase.from('legal_entities').select().eq('org', params.org_id)
	]);

	const updatePassword = async (password: string) => {
		'use server';
		const supabase = createClient();

		const { error, data } = await supabase.auth.updateUser({ password });

		if (error) return error?.message;
		if (data.user) return 'Password updated successfully';
	};

	return (
		<div className="mx-auto max-w-4xl">
			<Tabs defaultValue="personal" className="">
				<div className="mb-6 flex items-center gap-4">
					<h1 className="text-xl font-semibold">Settings</h1>

					<TabsList className="mb-px h-8 py-px">
						<TabsTrigger value="personal" className="h-6">
							Personal
						</TabsTrigger>
						<TabsTrigger value="org" className="h-6">
							Organisation
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="org">{organisationResponse.data && <LegalEntityForm orgId={Number(params.org_id)} data={organisationResponse.data} />}</TabsContent>

				<TabsContent value="personal">
					<SecurityForm updatePassword={updatePassword} />

					{profileResponse.data && <ProfileForm data={profileResponse.data} />}
					{profileResponse.error && <div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">Unable to fetch user data</div>}
				</TabsContent>
			</Tabs>
		</div>
	);
}
