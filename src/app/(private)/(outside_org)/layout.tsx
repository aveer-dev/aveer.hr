import { Header } from '@/components/layout/header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />

			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">
				<section>{children}</section>
			</main>
		</>
	);
}
