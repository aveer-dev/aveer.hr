import { Header } from '@/components/layout/header';
import { HeaderLoader } from '@/components/layout/header-loader';
import { Suspense } from 'react';

export const experimental_ppr = true;

export default function RootLayout(props: { children: React.ReactNode; params: Promise<{ [key: string]: string }> }) {
	return (
		<>
			<Suspense fallback={<HeaderLoader />}>
				<Header params={props.params} />
			</Suspense>

			<main className="mx-auto mt-[min(7%,4rem)] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-6">{props.children}</main>
		</>
	);
}
