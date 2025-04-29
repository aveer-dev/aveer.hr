import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsPageComponent } from './settings-page-component';

export default function SettingsPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
		<div className="mx-auto max-w-4xl">
			<Suspense
				fallback={
					<div className="space-y-14">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
					</div>
				}>
				<SettingsPageComponent params={props.params} searchParams={props.searchParams} />
			</Suspense>
		</div>
	);
}
