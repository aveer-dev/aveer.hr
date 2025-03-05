import { createClient } from '@/utils/supabase/server';
import { NavMenu } from './employee-nav-menu';
import { ContractStatus } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { EmployeeProfileSettings } from './employee-profile-settings';
import { EmployeePageSearch } from './employee-search';
import { ContractsPopover } from './contracts-popover';
import { Notifications } from './notifications';
import Link from 'next/link';
import { Undo2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	const { children } = props;

	const supabase = await createClient();

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
				<p>Unable to fetch contracts. Please login again</p>
				<p>{error?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	const contract = data.find(contract => String(contract.id) == params.contract);

	const { data: messages } = await supabase
		.from('inbox')
		.select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)')
		.or(`and(org.eq.${params.org},draft.eq.false),and(org.eq.${params.org},draft.eq.true,sender_profile.eq.${user?.id})`)
		.order('created_at', { ascending: false });

	return (
		<>
			<Header orgId={'employee'} messages={messages} />

			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">
				<section className="mx-auto max-w-3xl">
					<div className="mb-8 flex flex-col items-start justify-between gap-8 border-b pb-8 sm:flex-row">
						<div className="order-2 space-y-1 sm:order-1">
							<h1 className="text-2xl font-bold">Hi, {contract?.profile?.first_name}</h1>
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

						<div className="order-1 flex w-full items-center justify-end gap-3 sm:order-2 sm:w-fit sm:justify-start">
							<Notifications contractId={contract?.id} messages={messages} />

							<EmployeePageSearch />

							<EmployeeProfileSettings profile={contract?.profile as any} />
						</div>
					</div>

					{children}
				</section>

				<nav className="fixed bottom-0 left-1 right-1 z-10 flex w-full items-center justify-center gap-3 bg-gradient-to-t from-background to-transparent pb-6 pt-4 shadow-md backdrop-blur-sm sm:pb-12">
					{data.length > 1 && <ContractsPopover contracts={data} contractId={params.contract} />}

					<NavMenu contract={contract as any} />
				</nav>
			</main>
		</>
	);
}
