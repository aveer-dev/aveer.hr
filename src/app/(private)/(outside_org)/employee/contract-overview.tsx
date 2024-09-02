import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis } from 'recharts';
import { Separator } from '@/components/ui/separator';
import { EllipsisVertical, FileDown, FilePlus, FileText, Pencil, Trash2 } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LeaveRequestDialog } from './leave-request-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const chartConfig = {
	days: {
		label: 'Days used',
		color: 'hsl(var(--chart-1))'
	},
	leave: {
		label: 'Paid Leave'
	},
	sick: {
		label: 'Sick Leave'
	},
	paternity: {
		label: 'Paternity Leave'
	}
} satisfies ChartConfig;

interface props {
	isOpen: boolean;
	toggle: (open: boolean) => void;
	data?: Tables<'contracts'>;
}

const supabase = createClient();

export const ContractOverview = ({ isOpen, toggle, data }: props) => {
	const [chartData, setChartData] = useState<{ type: string; total: number; days: number }[]>([]);
	const [requests, setRequests] = useState<Tables<'time_off'>[]>([]);

	const getOrgSettings = useCallback(async (contract: Tables<'contracts'>) => {
		const { data, error } = await supabase
			.from('org_settings')
			.select()
			.eq('org', (contract.org as any).subdomain)
			.single();

		if (error) return toast('😬 Ooops', { description: 'Unable to fetch organisation policies' });
		const chartDataMap = ['leave', 'sick', 'paternity'];

		const chart = chartDataMap.map(label =>
			label == 'leave'
				? { type: 'leave', total: contract.paid_leave || data.paid_time_off || 20, days: contract.paid_leave_used }
				: label == 'sick'
					? { type: 'sick', total: contract.sick_leave || data.sick_leave || 20, days: contract.sick_leave_used }
					: { type: 'paternity', total: 20, days: contract.paternity_maternity_used }
		);
		setChartData(chart);
	}, []);

	const getRequests = useCallback(async (contract: Tables<'contracts'>) => {
		const { data, error } = await supabase
			.from('time_off')
			.select()
			.match({ org: (contract.org as any).subdomain, employee_id: (contract.profile as any).id, status: 'pending' });

		if (error) return toast('😬 Ooops', { description: 'Unable to fetch your requests' });

		setRequests(data);
	}, []);

	useEffect(() => {
		if (data) {
			getOrgSettings(data);
			getRequests(data);
		}
	}, [data, getOrgSettings]);

	return (
		<AlertDialog open={isOpen} onOpenChange={toggle}>
			<AlertDialogContent className="mx-auto max-h-[80vh] w-screen max-w-[unset] justify-center overflow-auto">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						{(data?.org as any).name}{' '}
						<Badge className="font-light" variant={'secondary'}>
							{(data?.entity as any).incorporation_country.name}
						</Badge>
					</AlertDialogTitle>

					<AlertDialogDescription>Role: {data?.job_title}</AlertDialogDescription>
				</AlertDialogHeader>

				<section className="mx-auto mt-6 flex w-full max-w-3xl flex-wrap gap-14">
					<Card className="grad h-fit w-[350px] border-none drop-shadow-sm backdrop-blur-md">
						<CardHeader className="p-4 pl-7">
							<CardTitle className="flex items-center justify-between text-2xl">
								Leave Days
								<div className="flex items-center gap-2">
									<LeaveRequestDialog profileId={data?.profile} contractId={data?.id} onCreateLeave={() => getRequests(data as any)} org={(data?.org as any).subdomain} />

									<Button variant={'secondary'} size={'icon'}>
										<EllipsisVertical size={12} />
									</Button>
								</div>
							</CardTitle>
						</CardHeader>

						<CardContent className="grid gap-10 p-4">
							<div className="grid gap-2 py-4">
								<div className="flex w-full justify-between px-4">
									{chartData.map((_data, index) => (
										<div key={index} className="w-20 text-center text-xs text-green-500">
											{chartData[index]?.total - chartData[index]?.days} days left
										</div>
									))}
								</div>

								<Separator />

								<div className="flex w-full justify-between px-4">
									{chartData.map((_data, index) => (
										<div key={index} className="w-20 text-center text-xs text-muted-foreground">
											{chartData[index]?.days} days down
										</div>
									))}
								</div>
							</div>

							{chartData.length == 0 && (
								<div className="flex gap-4">
									<Skeleton className="h-36 w-20" />
									<Skeleton className="h-36 w-20" />
									<Skeleton className="h-36 w-20" />
								</div>
							)}

							{chartData.length > 0 && (
								<ChartContainer config={chartConfig}>
									<BarChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} accessibilityLayer data={chartData}>
										<XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => chartConfig[value as keyof typeof chartConfig]?.label} />
										<ChartTooltip cursor={false} content={<ChartTooltipContent color="hsl(var(--foreground))" indicator="line" />} />
										<Bar background={{ fill: '#eee', radius: 6 }} dataKey="days" fill="var(--color-desktop)" radius={6} />
									</BarChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<div className="grid h-fit gap-14">
						<Card className="grad h-fit w-[350px] border-none drop-shadow-sm backdrop-blur-md">
							<CardContent className="grid gap-10 p-4">
								<h2 className="text-7xl font-bold">{requests.length}</h2>

								<div className="grid gap-2">
									<h3 className="text-sm">Pending Request</h3>
									<p className="text-xs text-muted-foreground">Requests pending approval</p>
								</div>
							</CardContent>
						</Card>

						<Card className="grad h-fit w-[350px] border-none drop-shadow-sm backdrop-blur-md">
							<CardContent className="grid gap-10 p-4">
								<h2 className="text-4xl font-bold">
									{data?.salary
										? new Intl.NumberFormat('en-US', {
												style: 'currency',
												currency: 'USD'
											}).format(data?.salary / 12)
										: '00'}
								</h2>

								<div className="grid gap-2">
									<h3 className="text-sm">Salary</h3>
									<p className="text-xs text-muted-foreground">Next payment date is 7th, May</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="grad h-fit w-[350px] border-none drop-shadow-sm backdrop-blur-md">
						<CardHeader>
							<CardTitle className="flex items-center justify-between text-base">
								Personal details
								<Button size={'icon'} className="h-8 w-8" variant={'secondary'}>
									<Pencil size={12} />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-10 p-6 pt-0">
							<ul className="grid gap-6 text-sm font-light">
								<li className="grid gap-1">
									First name <div className="font-medium">{(data?.profile as any)?.first_name}</div>
								</li>
								<li className="grid gap-1">
									Last name <div className="font-medium">{(data?.profile as any)?.last_name}</div>
								</li>
								<li className="grid gap-1">
									Gender <div className="font-medium"></div>
								</li>
								<li className="grid gap-1 !border-b-0">
									Email <div className="font-medium">{(data?.profile as any)?.email}</div>
								</li>
								<li className="!border-b-0">
									Country <div className="font-medium">{(data?.profile as any)?.nationality.name}</div>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="grad w-[350px] border-none drop-shadow-sm backdrop-blur-md">
						<CardHeader>
							<CardTitle className="flex items-center justify-between text-base">
								Documents
								<Button size={'icon'} className="h-8 w-8" variant={'secondary'}>
									<FilePlus size={12} />
								</Button>
							</CardTitle>
						</CardHeader>

						<CardContent className="grid gap-10 px-2 pb-6 pt-0">
							<ul className="grid gap-2 text-sm font-light">
								<li className="flex items-center justify-between gap-1 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent">
									<div className="flex items-center gap-2">
										<FileText size={12} className="text-muted-foreground" />
										NYSC certtificate.pdf
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
													<Button variant={'ghost'} className="flex w-full items-center justify-start gap-2">
														<FileDown size={14} />
														<span>Download</span>
													</Button>
												</DropdownMenuItem>

												<DropdownMenuItem asChild>
													<Button variant={'ghost'} className="flex w-full items-center justify-start gap-2 text-destructive hover:text-destructive">
														<Trash2 size={14} />
														<span>Delete</span>
													</Button>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>

								<li className="flex items-center justify-between gap-1 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent">
									<div className="flex items-center gap-2">
										<FileText size={12} className="text-muted-foreground" />
										NYSC certtificate.pdf
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
													<Button variant={'ghost'} className="flex w-full items-center justify-start gap-2">
														<FileDown size={14} />
														<span>Download</span>
													</Button>
												</DropdownMenuItem>

												<DropdownMenuItem asChild>
													<Button variant={'ghost'} className="flex w-full items-center justify-start gap-2 text-destructive hover:text-destructive">
														<Trash2 size={14} />
														<span>Delete</span>
													</Button>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>

								<li className="flex items-center justify-between gap-1 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent">
									<div className="flex items-center gap-2">
										<FileText size={12} className="text-muted-foreground" />
										NYSC certtificate.pdf
									</div>
									<div className="text-muted-foreground">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8" size={'icon'}>
													<EllipsisVertical size={12} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-fit" align="end">
												<DropdownMenuItem className="flex w-full items-center justify-start gap-2">
													<FileDown size={14} />
													<span>Download</span>
												</DropdownMenuItem>

												<DropdownMenuItem className="flex w-full items-center justify-start gap-2 text-destructive hover:text-destructive">
													<Trash2 size={14} />
													<span>Delete</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>
							</ul>
						</CardContent>
					</Card>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
};
