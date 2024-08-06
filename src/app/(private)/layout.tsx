import { NavMenu } from '@/components/nav-menu';
import { Button } from '@/components/ui/button';
import { CircleHelp, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<header className="flex w-full items-center justify-between border-b border-b-input px-6 py-4">
				<div className="font-logo text-xl font-light">aveer.hr</div>

				<NavMenu />

				<div className="flex items-center gap-3">
					<button className="flex items-center gap-2 text-xs">
						Do you need help <CircleHelp className="text-muted-foreground" size={16} />
					</button>

					<div className="h-3 w-px bg-muted-foreground"></div>

					<Button variant={'secondary'} size={'icon'} className="h-8">
						<LogOut size={12} />
					</Button>
				</div>
			</header>

			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-10 py-0 pb-28">
				<section>{children}</section>
			</main>
		</>
	);
}
