import { Suspense } from 'react';
import { LeavePage } from './leave-page';

interface props {
	params: Promise<{ [key: string]: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}

export default async function TimeOffPage(props0: props) {
	const params = await props0.params;

	return (
		<Suspense>
			<div className="mb-6 flex w-full items-center justify-between border-b pb-3">
				<h1 className="text-2xl font-medium">Leave History</h1>
			</div>
			<LeavePage org={params.org} />
		</Suspense>
	);
}
