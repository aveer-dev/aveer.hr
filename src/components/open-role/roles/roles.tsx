import { DataTable } from '@/components/dashboard/table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { columns } from './column';
import { jobColumns } from './job-column';

interface props {
	orgId: string;
	type: 'job' | 'role';
}

export const Roles = async ({ orgId, type }: props) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('open_roles').select('*, entity:legal_entities!open_roles_entity_fkey(id, name, incorporation_country)').match({ org: orgId });

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

					<div>
						{/* <DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={'ghost'} className="h-fit p-0">
									<Badge variant={'secondary'} className="gap-4 px-2 py-1 text-xs font-normal">
										<PlusIcon size={12} />
										Add Filter
									</Badge>
								</Button>
							</DropdownMenuTrigger> */}
						{/* <DropdownMenuContent className="w-56">
								<DropdownMenuItem>
									<Button>Profile</Button>
									 <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Billing</span>
									<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuContent> */}
						{/* </DropdownMenu> */}
					</div>

					{type == 'role' && (
						<Link href={`./open-roles/new`} className={cn(buttonVariants({ size: 'sm' }), 'ml-auto h-8 gap-4')}>
							<Plus size={12} />
							Create role
						</Link>
					)}
				</div>

				<DataTable columns={type == 'job' ? jobColumns : columns} data={data} />
			</div>
		</div>
	);
};
