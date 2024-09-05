import { DataTable } from '@/components/dashboard/table';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { columns } from './column';

interface props {
	params: { [key: string]: string };
	searchParams: { [key: string]: string };
}

export default async function TimeOffPage({ params, searchParams }: props) {
	const supabase = createClient();

	const { data, error } = await supabase.from('time_off').select('*, profile:profiles!time_off_profile_fkey(*)').match({ org: params.org });

	if (error) return;

	return (
		<Suspense>
			<div className="mb-6 flex w-full items-center justify-between">
				<h1 className="text-2xl font-medium">Leave History</h1>
			</div>

			<DataTable data={data} columns={columns} />
		</Suspense>
	);
}
