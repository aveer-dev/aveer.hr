import Image from 'next/image';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			<div className="flex items-center justify-center py-12">{children}</div>

			<div className="hidden bg-muted lg:block">{/* <Image src="/placeholder.svg" alt="Image" width="1920" height="1080" className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" /> */}</div>
		</main>
	);
}
