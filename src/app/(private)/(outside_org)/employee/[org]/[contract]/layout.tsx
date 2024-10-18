import { Button } from '@/components/ui/button';
import { EllipsisVertical } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createClient } from '@/utils/supabase/server';
import { NavMenu } from './employee-nav-menu';
import { ContractStatus } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error: authError
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch user details</p>
				<p>{authError?.message}</p>
			</div>
		);
	}

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('profile', user.id);

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	const contract = data.find(contract => String(contract.id) == params.contract);

	return (
		<>
			<Header orgId={'employee'} />

			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">
				<nav className="fixed bottom-0 left-0 right-0 z-10 flex w-full items-center justify-center gap-4 bg-gradient-to-t from-background to-transparent pb-12 pt-4 shadow-md backdrop-blur-sm">
					{data.length > 1 && (
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="h-[52px] w-[52px] rounded-full bg-background/5 shadow-md backdrop-blur-sm transition-all duration-500">
									<EllipsisVertical size={16} />
								</Button>
							</PopoverTrigger>

							<PopoverContent align="start" sideOffset={10} className="w-56 p-1">
								<Command>
									<CommandList>
										<CommandGroup>
											{data.map(contract => (
												<CommandItem key={contract.id} value={String(contract.id)}>
													{contract.org?.name} - {contract.job_title}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					)}

					<NavMenu />
				</nav>

				<section className="mx-auto max-w-3xl">
					<div className="mb-8 flex items-start justify-between border-b pb-8">
						<div className="space-y-1">
							<h1 className="text-2xl font-bold">Hi, Emmanuel</h1>
							{/* <p className="text-sm font-light text-support">
						{format(new Date(), 'eeee')}, {format(new Date(), 'LLLL')} {format(new Date(), 'M')}
					</p> */}
							{contract && (
								<div className="flex items-center gap-3 text-xs font-light">
									<span className="capitalize">{contract?.job_title}</span> • <span className="capitalize">{contract?.org?.name}</span> • <span className="capitalize">{contract?.employment_type}</span>
									<ContractStatus state={contract.status} start_date={contract.start_date || ''} end_date={contract?.end_date} />
									{contract?.status == 'scheduled termination' && contract?.end_date && (
										<>
											•
											<Badge className="h-fit gap-3 py-1 text-xs font-light" variant={contract?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
												{format(contract?.end_date, 'PP')}
											</Badge>
										</>
									)}
								</div>
							)}
						</div>

						<div className="flex items-center gap-2">
							<Button className="h-8 w-8 rounded-2xl border p-0" variant={'secondary'}>
								<Search size={12} />
							</Button>
						</div>
					</div>
					{children}
				</section>
			</main>
		</>
	);
}
