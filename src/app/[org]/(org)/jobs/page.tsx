import { Roles } from '@/components/open-role';
import { PageLoader } from '@/components/ui/page-loader';
import { Suspense } from 'react';

export default async function JobsPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
        (<Suspense fallback={<PageLoader />}>
            <Roles type={'job'} orgId={(await props.params).org} />
        </Suspense>)
    );
}
