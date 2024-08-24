'use server';

import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';
import { JobApplicationForm } from '@/components/job-application/application-form';
import { createClient } from '@/utils/supabase/server';
import { TablesInsert } from '@/type/database.types';

export default async function JobPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const submitApplication = async (application: TablesInsert<'job_applications'>) => {
		'use server';

		const supabase = createClient();
		const { error, data } = await supabase.from('job_applications').insert(application).select('id').single();
		if (error) return error.message;
		return data.id;
	};

	return (
		<Suspense>
			<RoleDetails type={'job'} orgId={params.org} role={params.id} />

			<JobApplicationForm roleId={Number(params.id)} org={params.org} submit={submitApplication} />
		</Suspense>
	);
}
