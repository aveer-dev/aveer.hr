import { Suspense } from 'react';
import { RoleDetails } from '@/components/open-role';
import { PageLoader } from '@/components/ui/page-loader';

export default async function RolePage(
    props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }
) {
    const params = await props.params;
    return (
		<Suspense fallback={<PageLoader />}>
			<RoleDetails type={'role'} orgId={params.org} role={params.role} />
		</Suspense>
	);
}
