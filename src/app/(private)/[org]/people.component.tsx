import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PeopleTable = async ({ org }: { org: string }) => {
	const supabase = createClient();
	const { data } = await supabase.from('contracts').select('profile(first_name,last_name,nationality(name)), org, id, status, job_title, employment_type, start_date').match({ org: org });

	return (
		<Suspense fallback={<Skeleton className="h-96 w-full max-w-[1200px]"></Skeleton>}>
			<ClientTable org={org} data={data as unknown as PERSON[]} />
		</Suspense>
	);
};