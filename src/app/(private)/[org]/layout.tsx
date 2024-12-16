import { Header } from '@/components/layout/header';

export default async function RootLayout(
    props: { children: React.ReactNode; params: Promise<{ [key: string]: string }> }
) {
    const params = await props.params;

    const {
        children
    } = props;

    return (
		<>
			<Header orgId={params.org} />

			<main className="mx-auto mt-[min(7%,4rem)] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-6">{children}</main>
		</>
	);
}
