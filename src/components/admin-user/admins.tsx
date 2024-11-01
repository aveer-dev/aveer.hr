import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { DataTable } from '../dashboard/table';
import { adminUserColumn } from './column';
import { Skeleton } from '@/components/ui/skeleton';
import { AddAdmin } from './admin';

interface props {
	org: string;
}

export const AdminUsers = async ({ org }: props) => {
	const supabase = createClient();

	const [
		{ data, error },
		{ data: employees },
		{
			data: { user }
		}
	] = await Promise.all([
		await supabase.from('profiles_roles').select(`*, profile:profiles!profiles_roles_profile_fkey(*)`).match({ organisation: org, disable: false }),
		await supabase.from('contracts').select(`*, profile:profiles!contracts_profile_fkey(*)`).match({ org, status: 'signed' }),
		await supabase.auth.getUser()
	]);

	if (error)
		return (
			<div className="flex h-48 w-full flex-row items-center justify-center gap-2 rounded-md">
				<h1 className="text-sm">Unable to fetch users</h1>
				<p className="text-xs text-muted-foreground">{error.message}</p>
			</div>
		);

	return (
		<Suspense
			fallback={
				<>
					<Skeleton className="h-32 w-full max-w-80" />
					<Skeleton className="h-32 w-full max-w-80" />
				</>
			}>
			<section className="border-t border-t-border py-8 md:py-10">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-base font-medium">Admin users</h1>
					<AddAdmin org={org} employees={employees?.filter(employee => !data.find(profile => profile.profile.id == (employee.profile as any).id)) || []} />
				</div>

				<DataTable data={data.map(item => ({ ...item, isUser: item.profile.id == user?.id }))} columns={adminUserColumn} />
			</section>
		</Suspense>
	);
};
