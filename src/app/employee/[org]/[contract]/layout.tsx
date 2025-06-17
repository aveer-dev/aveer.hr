import { createClient } from '@/utils/supabase/server';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { Undo2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmployeeActionBar from './employee-action-bar';

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
			<Header />
			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">{children}</main>

			<EmployeeActionBar contract={contract} messages={messages || []} />
		</>
	);
}
