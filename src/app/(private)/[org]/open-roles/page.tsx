import { Roles } from '@/components/open-role';
import { PageLoader } from '@/components/ui/page-loader';
import { Suspense } from 'react';

export default async function OpenRolesPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
        (<Suspense fallback={<PageLoader isLoading />}>
            <Roles type={'role'} orgId={(await props.params).org} />
        </Suspense>)
    );
}
