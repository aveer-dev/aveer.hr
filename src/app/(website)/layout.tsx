import Link from 'next/link';
import { Fragment, Suspense } from 'react';
import { AppLink } from './app-link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Metadata } from 'next';

const navItems: { label?: string; href?: string; type: 'link' | 'platform' }[] = [
	{
		label: 'Updates',
		href: '/updates',
		type: 'link'
	},
	{
		type: 'platform'
	}
];

export const metadata: Metadata = {
	title: {
		template: '%s | Aveer.hr',
		default: 'Aveer.hr'
	},
	description: 'A better way to manage your employees',
	openGraph: {
		title: {
			template: '%s | Aveer.hr',
			default: 'Aveer.hr'
		},
		description: 'A better way to manage your employees',
		images: ['/aveer.hrproduct-browser.png'],
		siteName: 'Aveer.hr',
		locale: 'en_US',
		type: 'website'
	}
};

export default function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="min-h-screen py-6">
			<header className="mx-auto flex max-w-3xl items-end justify-between px-5 lg:max-w-7xl">
				<div className="logo">
					<Link href={'/'} className="font-logo text-3xl font-light">
						aveer.hr
					</Link>
				</div>

				<nav>
					<ul className="flex items-center gap-6">
						{navItems.map((item, index) => (
							<Fragment key={index}>
								<li className="group">
									{item.type === 'link' && item.href ? (
										<Link href={item.href} className={cn(buttonVariants({ variant: 'ghost' }), 'h-7 rounded-full text-xs font-normal transition-all group-focus-within:bg-primary/5 group-hover:bg-primary/5 group-focus-visible:bg-primary/5')}>
											{item.label}
										</Link>
									) : (
										<Suspense fallback={<Skeleton className="h-8 w-24" />}>
											<AppLink />
										</Suspense>
									)}
								</li>
								{index !== navItems.length - 1 && <Separator orientation="vertical" className="h-4" />}
							</Fragment>
						))}
					</ul>
				</nav>
			</header>

			{children}

			<footer className="mt-24 w-full">
				<ul className="mx-auto w-fit">
					<li>
						<Link href={'https://aveer.hr/privacy-policy'} className="border-b text-sm">
							Privacy policy
						</Link>
					</li>
				</ul>
			</footer>
		</main>
	);
}
