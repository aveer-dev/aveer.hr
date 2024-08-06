import { Chart } from '@/components/dashboard/chart';
import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { ChevronsUpDown, Plus, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
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
			<div className="flex justify-between">
				<div className="flex w-full max-w-72 flex-wrap items-start justify-between gap-6">
					<div className="grid gap-2">
						<h3 className="text-base font-medium">People</h3>
						<p className="text-5xl font-bold">23</p>
					</div>

					<Chart />
				</div>

				<div className="flex w-full max-w-80 flex-wrap items-start justify-between gap-4">
					<div className="grid gap-2">
						<h3 className="text-base font-medium">Open roles</h3>
						<p className="text-5xl font-bold">10</p>
					</div>

					<Chart />
				</div>

				<div className="grid w-full max-w-80 gap-2">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-normal">Your tasks</h3>
						<div className="flex items-center gap-1">
							<Button size={'icon'} variant={'ghost'} className="h-8 w-8">
								<ChevronsUpDown size={16} />
							</Button>

							<div className="h-3 w-px bg-muted-foreground"></div>

							<Button size={'icon'} variant={'ghost'} className="h-8 w-8">
								<Plus size={16} />
							</Button>
						</div>
					</div>

					<ul className="grid gap-2">
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Approve data update</li>
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Company information</li>
					</ul>
				</div>
			</div>

			<div className="container mx-auto p-0">
				<div className="mb-6 flex w-full items-center gap-6">
					<h1 className="text-2xl font-medium">People</h1>

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
						App person
					</Link>
				</div>

				<DataTable columns={columns} data={data} />
			</div>
		</div>
	);
}
