'use server';

import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';

export default async function JobPage(
    props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }
) {
    const params = await props.params;
    return (
		<Suspense>
			<RoleDetails type={'job'} orgId={params.org} role={params.id} />
		</Suspense>
	);
}
