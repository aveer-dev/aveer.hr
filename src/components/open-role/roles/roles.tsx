import { DataTable } from '@/components/dashboard/table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { columns } from './column';
import { jobColumns } from './job-column';
import { ApplicantsColumn } from './applicants-column';

interface props {
	orgId: string;
	type: 'job' | 'role';
}

export const Roles = async ({ orgId, type }: props) => {
	const supabase = createClient();

	const query: { org: string; state?: string } = { org: orgId };
	if (type == 'job') query.state = 'open';

	const { data, error } = await supabase.from('open_roles').select('*, entity:legal_entities!profile_contract_entity_fkey(id, name, incorporation_country)').match(query);

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch roles, please refresh page to try again</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	if (data && !data.length) {
		return (
			<div className="flex min-h-[50vh] flex-col items-center justify-center gap-10 text-center">
				<div className="grid gap-3">
					<p className="text-base font-bold">You do not have any open roles yet</p>
					<p className="text-xs text-muted-foreground">Will you like to create one?</p>
				</div>

				<Link href={'./open-roles/new'} className={cn(buttonVariants(), 'gap-4')}>
					<Plus size={12} />
					Create role
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto grid gap-20">
			<div className="container mx-auto p-0">
				<div className="mb-6 flex w-full items-center gap-6">
					<h1 className="text-2xl font-medium">Open roles</h1>

					{type == 'role' && (
						<div className="ml-auto flex gap-4">
							<Link href={'./jobs'} className={cn(buttonVariants({ variant: 'secondary' }), 'gap-4')}>
								Jobs page
								<ArrowUpRight size={12} />
							</Link>
							<Link href={`./open-roles/new`} className={cn(buttonVariants({ size: 'sm' }), 'h-8 gap-4')}>
								<Plus size={12} />
								Create role
							</Link>
						</div>
					)}
				</div>

				<DataTable org={orgId} subColumns={ApplicantsColumn} columns={type == 'job' ? jobColumns : columns} data={data} />
			</div>
		</div>
	);
};
