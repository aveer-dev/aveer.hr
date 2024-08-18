import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';
import { PageLoader } from '@/components/ui/page-loader';

export default async function RolePage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<Suspense fallback={<PageLoader />}>
			<RoleDetails type={'role'} orgId={params.org} role={params.role} />
		</Suspense>
	);
}
