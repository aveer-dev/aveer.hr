import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarPageComponent } from './calendar-page';

export default async function CalendarPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const org = (await props.params).org;

	return (
		<Suspense
			fallback={
				<div className="mx-auto w-full space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-96 w-full" />
				</div>
			}>
			<CalendarPageComponent org={org} />
		</Suspense>
	);
}
