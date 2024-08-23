import { Roles } from '@/components/open-role';
import { PageLoader } from '@/components/ui/page-loader';
import { Suspense } from 'react';

export default async function OpenRolesPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<Suspense fallback={<PageLoader isLoading />}>
			<Roles type={'role'} orgId={props.params.org} />
		</Suspense>
	);
}
