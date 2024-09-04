import { Header } from '@/components/layout/header';

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { [key: string]: string } }) {
	return (
		<>
			<Header orgId={params.org} />

			<main className="relative mx-auto mt-[min(7%,4rem)] min-h-screen w-full max-w-7xl px-6 py-0 pb-28">{children}</main>
		</>
	);
}
