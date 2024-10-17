import { AccountTypeToggle } from '@/components/layout/account-type-toggle';
import { Button } from '@/components/ui/button';
import { ChevronRight, FilePenLine, House, Info, ListChecks, Signature, UserRoundCog, UsersRound } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode; params: { [key: string]: string } }) {
	const navItems = [
		{ label: 'Home', icon: House },
		{ label: 'Profile', icon: UserRoundCog },
		{ label: 'Team', icon: UsersRound },
		{ label: 'Contract', icon: Signature },
		{ label: 'Appraisal', icon: FilePenLine },
		{ label: 'Oboarding', icon: ListChecks }
	];

	return (
		<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">
			{/* <nav className="group fixed bottom-0 left-0 top-0 flex flex-col items-start justify-between bg-foreground/5 px-3 pb-4 pt-6">
				<div className="space-y-2">
					<div className="font-logo text-2xl font-light">aveer</div>

					<Button variant={'outline'} className="h-6 w-full px-1">
						Admin
						<ChevronRight className="h-3 w-0 transition-all duration-500 group-focus-within:ml-3 group-focus-within:w-3 group-hover:ml-3 group-hover:w-3" />
					</Button>
				</div>

				<ul className="space-y-3 *:px-2 *:py-2">
					{navItems.map((item, index) => (
						<li key={index} className="flex items-center transition-all duration-500">
							<item.icon size={16} className="transition-all duration-500" />
							<div className="w-0 overflow-hidden text-sm font-light transition-all duration-500 group-focus-within:ml-4 group-focus-within:w-[4.1rem] group-hover:ml-4 group-hover:w-[4.1rem]">{item.label}</div>
						</li>
					))}
				</ul>

				<Button variant={'outline'} className="w-fit">
					<Info size={14} />
				</Button>
			</nav> */}

			<ul className="fixed bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-3xl bg-foreground/5 px-3 py-2 shadow-md backdrop-blur-sm transition-all duration-500 *:px-2 *:py-2">
				{navItems.map((item, index) => (
					<li key={index} className="group flex items-center rounded-3xl transition-all duration-500 hover:bg-background hover:px-3">
						<item.icon size={16} className="transition-all duration-500" />
						<div className="w-0 overflow-hidden text-sm font-light transition-all duration-500 group-focus-within:ml-4 group-focus-within:w-[4.1rem] group-hover:ml-4 group-hover:w-[4.1rem]">{item.label}</div>
					</li>
				))}
			</ul>

			{children}
		</main>
	);
}
