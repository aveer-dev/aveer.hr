import { createClient } from '@/utils/supabase/server';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { Undo2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmployeeActionBar from './employee-action-bar';
import { UpdatesAlertDialog } from './_updates/updates-alert-dialog';
import { ContractRepository, UserUpdateViewRepository } from '@/dal';
import path from 'path';
import { UPDATE } from '@/type/updates';
import { compileMDX, CompileMDXResult } from 'next-mdx-remote/rsc';
import fs from 'fs/promises';

const CONTENTS_DIR = path.join(process.cwd(), 'src/updates-content/employee');

async function getUpdates(): Promise<CompileMDXResult<UPDATE>[]> {
	const files = await fs.readdir(CONTENTS_DIR);
	const posts = await Promise.all(
		[...files]
			.filter(file => file.endsWith('.mdx'))
			.map(async file => {
				const filePath = path.join(CONTENTS_DIR, file);
				const source = await fs.readFile(filePath, 'utf8');
				const data = await compileMDX<UPDATE>({ source, options: { parseFrontmatter: true } });
				return data;
			})
	);
	return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

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

	const userUpdateViewRepository = new UserUpdateViewRepository();
	const contractRepository = new ContractRepository();

	const [{ data: contracts, error: contractsError }, { data: messages }, { data: userUpdateView }, updates] = await Promise.all([
		contractRepository.getByProfileWithProfileAndTeam({ id: user.id, org: params.org }),
		supabase.from('inbox').select('*, sender_profile:profiles!inbox_sender_profile_fkey(id, first_name, last_name)').or(`and(org.eq.${params.org},draft.eq.false),and(org.eq.${params.org},draft.eq.true,sender_profile.eq.${user?.id})`).order('created_at', { ascending: false }),
		userUpdateViewRepository.getByUserAndContract({ userId: user.id, contractId: Number(params.contract), platform: 'employee' }),
		getUpdates()
	]);

	if (contractsError) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts. Please login again</p>
				<p>{contractsError?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	const contract = contracts?.find(contract => String(contract.id) == params.contract);

	return (
		<>
			<Header />
			{contract && <UpdatesAlertDialog userId={user.id} contractId={contract.id} userUpdateView={userUpdateView} updates={updates} />}
			<main className="relative mx-auto mt-[5%] min-h-screen w-full max-w-7xl px-4 py-0 pb-28 sm:px-10">{children}</main>

			<EmployeeActionBar contract={contract} messages={messages || []} />
		</>
	);
}
