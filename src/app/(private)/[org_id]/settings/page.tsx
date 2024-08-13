import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateOrgForm } from '../../(outside_org)/create-organisation/form';
import { SecurityForm } from './profile-security-form';
import { ProfileForm } from './profile-form';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsPage() {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) return <div>Unable to fetch user data</div>;

	const { data, error } = await supabase.from('profiles').select().eq('id', user?.id).single();
	if (!data || error) return <div>Unable to fetch user data</div>;

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

				<TabsContent value="org">
					<CreateOrgForm />
				</TabsContent>

				<TabsContent value="personal">
					<SecurityForm updatePassword={updatePassword} />

					<ProfileForm data={data} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
