import { Header } from '@/components/layout/header';
import { OrgWrapper } from './org-wrapper';
import { Suspense } from 'react';
import { HeaderLoader } from '@/components/layout/header-loader';

export const experimental_ppr = true;

export default function RootLayout(props: { children: React.ReactNode; params: Promise<{ [key: string]: string }> }) {
	return (
		<>
			<Suspense fallback={<HeaderLoader />}>
				<Header params={props.params} />
			</Suspense>

			<main className="mx-auto mt-[min(7%,4rem)] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-6">
				<OrgWrapper params={props.params}>{props.children}</OrgWrapper>
			</main>
		</>
	);
}
