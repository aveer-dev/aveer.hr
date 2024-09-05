import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { ApplicantDetails } from '@/components/open-role/roles/applicant-details';
import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { Tables } from '@/type/database.types';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarDays, Check, Mail, UserPlus2Icon, X } from 'lucide-react';

const supabase = createClient();

export const ApplicantsSubTable = ({ org, roleId }: { org?: string; roleId: number }) => {
	const [data, setData] = useState<Tables<'job_applications'>[]>([]);
	const [isLoading, setLoadingState] = useState(true);

	const getApplicants = useCallback(
		async (org: string, roleId: number) => {
			setLoadingState(true);
			const { data, error } = await supabase
				.from('job_applications')
				.select('*, country_location:countries!job_applications_country_location_fkey(name, country_code), org:organisations!job_applications_org_fkey(subdomain, name), role:open_roles!job_applications_role_fkey(job_title, id)')
				.match({ org, role: roleId })
				.order('created_at');

			setLoadingState(false);
			if (data) setData(data as any);
			if (error) toast.error(error.message);
		},
		[setLoadingState, setData]
	);

	const columns: ColumnDef<Tables<'job_applications'>>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary"
					checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
					onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => <Checkbox checked={row.getIsSelected()} className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary" onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" />,
			enableSorting: false,
			enableHiding: false,
			size: 80
		},
		{
			id: 'name',
			header: 'Full name',
			cell: ({ row }) => (
				<div className="grid gap-2">
					<div>
						<span>{row.original.first_name}</span> <span>{row.original.last_name}</span>
					</div>
					<div className="text-muted-foreground">{row.original.email}</div>
				</div>
			)
		},
		{
			id: 'country',
			header: 'Country',
			cell: ({ row }) => <span>{(row.original.country_location as any)?.name}</span>
		},
		{
			id: 'stage',
			header: 'Stage',
			cell: ({ row }) => (
				<Badge className="font-light" variant={row.original.stage.includes('reject') ? 'secondary-destructive' : row.original.stage == 'applicant' ? 'secondary' : 'secondary-success'}>
					{row.original.stage}
				</Badge>
			),
			size: 120
		},
		{
			accessorKey: 'require_sponsorship',
			header: 'Sponsorship',
			cell: ({ row }) => <span className="capitalize">{row.original.require_sponsorship ? 'Yes' : 'No'}</span>,
			size: 80
		},
		{
			accessorKey: 'gender',
			header: 'Gender',
			cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
			size: 80
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return (
					<>
						<UpdateApplicantState
							stage={row.original.stage}
							onUpdateItem={event => {
								if (org && roleId) return getApplicants(org, roleId);
							}}
							id={row.original.id}
							email={row.original.email}
							orgName={(row.original.org as any).name}
							name={row.original.first_name}
						/>
					</>
				);
			},
			size: 180
		},
		{
			id: 'open',
			cell: ({ row }) => (
				<ApplicantDetails
					onUpdate={() => {
						if (org && roleId) return getApplicants(org, roleId);
					}}
					data={row.original}
				/>
			),
			size: 80
		}
	];

	useEffect(() => {
		if (org && roleId) getApplicants(org, roleId);
	}, [getApplicants, org, roleId]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<tr>
			<td colSpan={7} className="border-b pl-8">
				<Table>
					<TableHeader className="">
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id} className="!border-b">
								{headerGroup.headers.map(header => {
									return (
										<TableHead style={{ width: header.column.getSize() }} className="text-xs" key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{!isLoading ? (
							table.getRowModel().rows?.length ? (
								// table has data
								table.getRowModel().rows.map(row => (
									<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="cursor-pointer">
										{row.getVisibleCells().map(cell => (
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)
						) : (
							<TableRow>
								<TableCell className="">
									<Skeleton className="h-5 w-5" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-9 w-56" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-6 w-32" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-5 w-20" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-12" />
								</TableCell>
								<TableCell className="">
									<Skeleton className="h-4 w-12" />
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</td>
		</tr>
	);
};

export const UpdateApplicantState = ({ id, onUpdateItem, name, stage, email, orgName, className }: { className?: string; name: string; id: number; email: string; orgName: string; onUpdateItem: (stage: string) => void; stage: string }) => {
	const [showRejectionDialog, toggleRejectionDialog] = useState(false);

	return (
		<>
			{stage == 'applicant' && (
				<AcceptRejectApplicant
					id={id}
					onUpdateItem={stage => {
						if (stage !== 'rejected') return onUpdateItem(stage);
						toggleRejectionDialog(stage == 'rejected');
					}}
				/>
			)}

			{stage !== 'rejected' && stage != 'applicant' && <AcceptedApplicantActions name={name} org={orgName} email={email} />}

			<ComposeMailDialog
				isOpen={showRejectionDialog}
				toggleDialog={toggleRejectionDialog}
				subject={`${name} application update`}
				recipients={[email]}
				name={`Update from ${orgName}`}
				onClose={state => {
					onUpdateItem(stage);
					if (state == 'success') toast.success('Application update sent');
				}}
				title="Send rejection email"
				description="Send a message to applicant about this rejection."
				message={`Hey ${name},

Thanks for taking the time to meet with us recently and for your interest in ${orgName}. We appreciate the chance to get to know you.

We've received many applications for the role and decided to consider other applicants for now. We will certainly reach out if new opportunities arise in the future.

All the best.
HR at ${orgName}`}
			/>
		</>
	);
};

const AcceptRejectApplicant = ({ id, onUpdateItem }: { id: number; onUpdateItem: (stage: string) => void }) => {
	const [isRejecting, setRejectState] = useState(false);
	const [isAccepting, setAcceptState] = useState(false);

	const updateApplication = async (stage: 'accepted' | 'rejected') => {
		if (stage == 'rejected') setRejectState(true);
		if (stage == 'accepted') setAcceptState(true);

		const { data, error } = await supabase.from('job_applications').update({ stage }).eq('id', id).select('first_name, org:organisations!job_applications_org_fkey(name, subdomain)').single();
		setRejectState(false);
		setAcceptState(false);

		if (error) return toast('😭 Error', { description: error.message });
		if (data) {
			toast.success('Done!', { description: `Applicant has been been ${stage}` });
			onUpdateItem(stage);
		}
	};

	return (
		<div className="flex items-center gap-3">
			<Button onClick={() => updateApplication('accepted')} disabled={isAccepting || isRejecting} className="flex h-7 gap-3 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-400 focus:bg-green-100 focus:text-green-400" variant={'ghost'}>
				{isAccepting && <LoadingSpinner className="text-white" />}
				{!isAccepting && <Check size={12} />} Accept
			</Button>

			<Button disabled={isAccepting || isRejecting} onClick={() => updateApplication('rejected')} className="flex h-7 gap-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" variant={'destructive'}>
				{isRejecting && <LoadingSpinner className="text-white" />}
				{!isRejecting && <X size={12} />} Reject
			</Button>
		</div>
	);
};

const AcceptedApplicantActions = ({ email, name, org }: { email: string; org: string; name: string }) => {
	const [showMailDialog, toggleMailDialog] = useState(false);

	return (
		<div className="flex w-full gap-3 lg:justify-center">
			<Button className="gap-2" size={'icon'} variant="secondary" title="Send meeting schedule">
				<span className="sr-only">Send meeting schedule</span>
				<CalendarDays size={12} />
			</Button>

			<Button className="gap-2" onClick={() => toggleMailDialog(true)} size={'icon'} variant="secondary" title="Send mail">
				<span className="sr-only">Send mail</span>
				<Mail size={12} />
			</Button>

			<Button className="gap-2" size={'icon'} variant="secondary" title="Add hiring manager">
				<span className="sr-only">Add hiring manager</span>
				<UserPlus2Icon size={12} />
			</Button>

			<ComposeMailDialog title={`Send message to ${name}`} onClose={state => state == 'success' && toast.success(`Message sent to ${name}`)} isOpen={showMailDialog} toggleDialog={toggleMailDialog} recipients={[email]} name={`Message from ${org}`} />
		</div>
	);
};
