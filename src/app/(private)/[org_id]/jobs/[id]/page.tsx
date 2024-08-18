import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';

export default async function JobPage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<Suspense>
			<RoleDetails type={'job'} orgId={params.org_id} role={params.id} />
		</Suspense>
	);
}
