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
			id: '728ed52f',
			first_name: 'Emmanuel',
			last_name: 'Aina',
			country: 'Nigeria',
			status: 'pending',
			email: 'm@example.com',
			job_title: 'Software Engineer',
			start_date: '12 May, 2024',
			employment_type: 'Full-time'
		},
		{
			id: '728ed52f',
			first_name: 'Emmanuel',
			last_name: 'Aina',
			country: 'United States',
			status: 'pending',
			email: 'm@example.com',
			job_title: 'Business Developer',
			start_date: '12 Jan, 2024',
			employment_type: 'Full-time'
		},
		{
			id: '728ed52f',
			first_name: 'Emmanuel',
			last_name: 'Aina',
			country: 'United Kingdom',
			status: 'pending',
			email: 'm@example.com',
			job_title: 'Sales Manager',
			start_date: '12 Dec, 2012',
			employment_type: 'Part-time'
		},
		{
			id: '728ed52f',
			first_name: 'Emmanuel',
			last_name: 'Aina',
			country: 'Ghana',
			status: 'pending',
			email: 'm@example.com',
			job_title: 'Chief Executive Officer',
			start_date: '12 Sept, 2016',
			employment_type: 'Full-time'
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

				<DataTable columns={columns} data={data} />
			</div>
		</div>
	);
}
