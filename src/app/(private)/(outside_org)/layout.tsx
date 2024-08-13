import { Header } from '@/components/layout/header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />

			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-10 py-0 pb-28">
				<section>{children}</section>
			</main>
		</>
	);
}
