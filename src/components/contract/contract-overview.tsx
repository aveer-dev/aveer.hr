import { Button } from '@/components/ui/button';
import { EllipsisVertical, FileText, PanelRightOpen, Table2 } from 'lucide-react';
import { Database, Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveRequestDialog } from './leave-request-dialog';
import { differenceInBusinessDays } from 'date-fns';
import { FileDropZone, FileUpload } from './file-management/file-upload-zone';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DeleteFile } from './file-management/delete-file';
import { DownloadFile } from './file-management/download-file';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

interface props {
	data: Tables<'contracts'> & { profile: Tables<'profiles'>; org: Tables<'organisations'> };
}

export const ContractOverview = async ({ data }: props) => {
	const supabase = createClient();

	const chartData: { label: Database['public']['Enums']['leave_type_enum']; total: number; days: number }[] = [
		{ label: 'paid', total: data.paid_leave as number, days: data.paid_leave_used as number },
		{ label: 'sick', total: data.sick_leave as number, days: data.sick_leave_used as number },
		{ label: 'paternity', total: data.paternity_leave as number, days: data.paternity_leave_used as number },
		{ label: 'maternity', total: data.maternity_leave as number, days: data.maternity_leave_used as number }
	];

	const { data: timeOffRequests, error } = await supabase
		.from('time_off')
		.select()
		.match({ org: data.org.subdomain, profile: (data.profile as any).id, status: 'pending' });
	if (error) return 'Error';

	const files = await supabase.storage.from('documents').list(`${data.org.id}/${data.profile?.id}`);

	const pendingLeaveDays = (type: Database['public']['Enums']['leave_type_enum']) => {
		const requests = timeOffRequests.filter(request => request.leave_type == type);
		let days = 0;
		requests.forEach(request => (days = days + (differenceInBusinessDays(request.to, request.from) + 1)));
		return days;
	};

	const LeaveStat = ({ days, total, label }: { days: number; total: number; label: Database['public']['Enums']['leave_type_enum'] }) => {
		const percentage = (days / total) * 100;
		const pending = { days: pendingLeaveDays(label), percentage: (pendingLeaveDays(label) / total) * 100 };

		return (
			<div className="space-y-2">
				<div className="relative h-1 w-full rounded-md bg-accent">
					<div className="absolute bottom-0 left-0 top-0 z-10 rounded-md bg-foreground transition-all" style={{ width: percentage + '%' }}>
						{percentage > 0 && <div className="absolute -right-px bottom-0 h-8 border-r pr-2 text-xs text-muted-foreground">{percentage}%</div>}
					</div>
					<div className="absolute bottom-0 left-0 top-0 rounded-md bg-orange-300 transition-all" style={{ width: pending.percentage + percentage + '%' }}>
						{pending.percentage > 0 && (
							<div className={cn('absolute -right-px bottom-0 border-r pr-2 text-xs text-muted-foreground', percentage > 0 ? 'h-16' : 'h-12')}>
								<div>pending</div>
								{pending.percentage}%
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between">
					<h3 className="mt-2 text-xs font-normal">
						<span className="capitalize">{label}</span> leave
					</h3>
					<div className="space-y-1 text-xs text-muted-foreground">
						<p>
							{days} days of {total} days
						</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<section className="mt-6 flex w-full flex-wrap gap-14 space-y-8">
			{/* leave */}
			<div className="w-full">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Leave Days</h2>

					<div className="flex items-center gap-2">
						<LeaveRequestDialog contract={data} />

						<Button variant={'secondary'} size={'icon'} className="h-9">
							<Table2 size={14} />
						</Button>
					</div>
				</div>

				<div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-16">
					{chartData.map(stat => (
						<LeaveStat key={stat.label} {...stat} />
					))}
				</div>

				{chartData.length == 0 && (
					<div className="flex gap-4">
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
					</div>
				)}
			</div>

			<Separator />

			{/* salary */}
			<div className="w-full">
				<div className="mb-12 flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Salary</h2>

					<div className="flex items-center gap-2">
						<Button variant={'secondary'} className="h-9 gap-3">
							History
							<PanelRightOpen size={14} />
						</Button>
					</div>
				</div>

				<h3 className="text-4xl font-bold">
					{data?.salary
						? new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(data?.salary)
						: '00'}
				</h3>

				<div className="mt-3">
					<p className="text-xs text-muted-foreground">This is you gross annual pay as stated in your contract</p>
				</div>
			</div>

			<Separator />

			{/* documents */}
			<div className="w-full">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Documents</h2>

					<div className="flex items-center gap-2">
						<FileUpload orgId={data.org.id} employeeProfileId={data.profile?.id} />
					</div>
				</div>

				<FileDropZone orgId={data.org.id} employeeProfileId={data.profile?.id}>
					{files.data && files.data.length > 0 && (
						<ul className="grid gap-2 rounded-md bg-secondary/50 p-2 text-sm font-light">
							{files.data?.map(file => (
								<li key={file.id} className="flex items-center justify-between gap-1 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent">
									<div className="flex items-center gap-2">
										<FileText size={12} className="text-muted-foreground" />
										{file.name}
									</div>

									<div className="text-muted-foreground">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8" size={'icon'}>
													<EllipsisVertical size={12} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-fit" align="end">
												<DropdownMenuItem asChild>
													<DownloadFile path={`${data.org.id}/${data.profile?.id}/${file.name}`} />
												</DropdownMenuItem>

												<DropdownMenuItem asChild>
													<DeleteFile path={`${data.org.id}/${data.profile?.id}/${file.name}`} />
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>
							))}
						</ul>
					)}

					{!files.data ||
						(files.data.length == 0 && (
							<div className="flex h-full min-h-44 w-full items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
								<p>No file has been uploaded yet</p>
							</div>
						))}
				</FileDropZone>
			</div>
		</section>
	);
};
