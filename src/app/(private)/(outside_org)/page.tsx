import { OrgsList } from './organisations';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loader';

export default function OrgsPage() {
	return (
		<Suspense
			fallback={
				<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-125">
					<LoadingSpinner className="" />
				</div>
			}>
			<OrgsList />
		</Suspense>
	);
}
