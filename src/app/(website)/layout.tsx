import Link from 'next/link';
import { Suspense } from 'react';
import { AppLink } from './app-link';
import { Skeleton } from '@/components/ui/skeleton';

export default function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<main>
			<div className="min-h-screen overflow-hidden py-6">
				<header className="mx-auto flex max-w-6xl items-center justify-between px-5">
					<div className="logo">
						<Link href={'/'} className="font-logo text-3xl font-light">
							aveer.hr
						</Link>
					</div>

					<nav>
						<Suspense fallback={<Skeleton className="h-4 w-9" />}>
							<AppLink />
						</Suspense>
					</nav>
				</header>

				{children}

				<footer className="w-full">
					<ul className="mx-auto w-fit">
						<li>
							<Link href={'https://aveer.hr/privacy-policy'} className="border-b text-sm">
								Privacy policy
							</Link>
						</li>
					</ul>
				</footer>
			</div>
		</main>
	);
}
