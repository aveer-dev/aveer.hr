import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { createClient } from '@/utils/supabase/server';
import { PlusIcon, Plus } from 'lucide-react';
import Link from 'next/link';

export const PeopleTable = async ({ orgId }: { orgId: string }) => {
	const supabase = createClient();
	const { data } = await supabase.from('contracts').select('profile(first_name,last_name,nationality(name)), id, status, job_title, employment_type, start_date').eq('org', orgId);

	return (
		<div className="container mx-auto p-0">
			<div className="mb-6 flex w-full items-center gap-6">
				<h1 className="text-2xl font-medium">People</h1>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={'ghost'} className="h-fit p-0">
							<Badge variant={'secondary'} className="gap-4 px-2 py-1 text-xs font-normal">
								<PlusIcon size={12} />
								Add Filter
							</Badge>
						</Button>
					</DropdownMenuTrigger>
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
				</DropdownMenu>

				<Link href={`${orgId}/add-people`} className={cn(buttonVariants({ size: 'sm' }), 'ml-auto h-8 gap-4')}>
					<Plus size={12} />
					App person
				</Link>
			</div>

			{data && <DataTable columns={columns} data={data as unknown as PERSON[]} />}
		</div>
	);
};
