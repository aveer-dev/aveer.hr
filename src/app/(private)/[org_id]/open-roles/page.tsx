import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { Plus, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function PeoplePage() {
	const data: PERSON[] = [
		{
			status: 'awaiting signatures',
			job_title: 'New',
			employment_type: 'full-time',
			start_date: '2024-08-09',
			profile: { last_name: 'Aina', first_name: 'Emmanuel', nationality: { name: 'AF' } },
			id: '393'
		}
	];

	return (
		<div className="mx-auto grid gap-20">
			<div className="container mx-auto p-0">
				<div className="mb-6 flex w-full items-center gap-6">
					<h1 className="text-2xl font-medium">Open roles</h1>

					<div>
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
					</div>

					<Link href={'/add-people'} className={cn(buttonVariants({ size: 'sm' }), 'ml-auto h-8 gap-4')}>
						<Plus size={12} />
						Create role
					</Link>
				</div>

				<DataTable orgId="" columns={columns} data={data} />
			</div>
		</div>
	);
}
