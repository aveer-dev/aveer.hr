import { Suspense } from 'react';
import { PageComponent } from './page-component';
import { PageLoader } from '@/components/ui/page-loader';

export const experimental_ppr = true;

export default function OrgPage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	return (
		<section className="mx-auto">
			<Suspense fallback={<PageLoader isLoading={true} />}>
				<PageComponent {...props} />
			</Suspense>
		</section>
	);
}
