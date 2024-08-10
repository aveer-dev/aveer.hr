import { OrgsList } from './organisations';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui/page-loader';

export default function OrgsPage() {
	return (
		<Suspense fallback={<PageLoader />}>
			<OrgsList />
		</Suspense>
	);
}
