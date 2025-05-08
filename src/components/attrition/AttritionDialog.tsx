'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis } from 'recharts';
import { ContractWithProfileAndTeam } from '@/dal/interfaces/contract.repository.interface';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, addMonths, isSameMonth } from 'date-fns';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogCancel, AlertDialogDescription } from '../ui/alert-dialog';
import { Separator } from '../ui/separator';
import { Tables } from '@/type/database.types';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { DropdownCategoryTitle } from '@/components/tiptap/components/dropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CircleX, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { badgeVariants } from '../ui/badge';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';

const GENDER_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'lgbtq+', label: 'LGBTQ+' }
];

function getGender(profile?: { gender?: string | null }) {
	if (!profile?.gender) return 'other';
	const g = profile.gender.toLowerCase();
	if (g === 'male' || g === 'female' || g === 'lgbtq+') return g;
	return 'other';
}

function monthKey(date: Date) {
	return format(date, 'yyyy-MM');
}

function getMonthRange(contracts: ContractWithProfileAndTeam[]) {
	let min: Date | null = null;
	let max: Date | null = null;
	contracts.forEach(c => {
		if (c.start_date) {
			const d = parseISO(c.start_date);
			if (!min || d < min) min = d;
			if (!max || d > max) max = d;
		}
		if (c.end_date) {
			const d = parseISO(c.end_date);
			if (!min || d < min) min = d;
			if (!max || d > max) max = d;
		}
	});
	if (!min) min = new Date();
	if (!max) max = new Date();
	return { min, max };
}

function processAttritionData(contracts: ContractWithProfileAndTeam[], start: Date, end: Date, gender: string) {
	// Filter contracts by gender
	const filtered = contracts.filter(c => {
		if (gender === 'all') return true;
		return getGender(c.profile) === gender;
	});

	// Build month buckets
	const months: string[] = [];
	let cursor = startOfMonth(start);
	const endMonth = startOfMonth(end);
	while (!isAfter(cursor, endMonth)) {
		months.push(monthKey(cursor));
		cursor = addMonths(cursor, 1);
	}

	// For each month, count hires, terminations, and compute attrition rate
	const data = months.map(m => {
		const [year, month] = m.split('-');
		const monthStart = new Date(Number(year), Number(month) - 1, 1);
		const monthEnd = endOfMonth(monthStart);

		// Hires: contracts with start_date in this month
		const hires = filtered.filter(c => c.start_date && isSameMonth(parseISO(c.start_date), monthStart)).length;

		// Terminations: contracts with end_date in this month or status terminated/scheduled termination
		const terminations = filtered.filter(c => c.end_date && isSameMonth(parseISO(c.end_date), monthStart) && (c.status === 'terminated' || c.status === 'scheduled termination' || c.status === 'inactive')).length;

		// Headcount: contracts active at any point in the month
		const headcount = filtered.filter(c => {
			const startD = c.start_date ? parseISO(c.start_date) : null;
			const endD = c.end_date ? parseISO(c.end_date) : null;
			return startD && !isAfter(startD, monthEnd) && (!endD || !isBefore(endD, monthStart));
		}).length;
		const attritionRate = headcount > 0 ? (terminations / headcount) * 100 : 0;

		return {
			month: format(monthStart, 'MMM yyyy'),
			hires,
			terminations,
			headcount,
			attritionRate: Number(attritionRate.toFixed(2))
		};
	});

	// Summary
	const totalHires = data.reduce((a, b) => a + b.hires, 0);
	const totalTerminations = data.reduce((a, b) => a + b.terminations, 0);
	const totalAttrition = data.reduce((a, b) => a + b.attritionRate, 0);
	const avgAttrition = data.length ? totalAttrition / data.length : 0;
	let highest = data[0];
	let lowest = data[0];

	data.forEach(d => {
		if (d.attritionRate > highest.attritionRate) highest = d;
		if (d.attritionRate < lowest.attritionRate) lowest = d;
	});
	return {
		data,
		summary: {
			totalHires,
			totalTerminations,
			avgAttrition: Number(avgAttrition.toFixed(2)),
			highest,
			lowest
		}
	};
}

const FILTERS = [
	{ key: 'team', label: 'Team' },
	{ key: 'gender', label: 'Gender' },
	{ key: 'dateRange', label: 'Date Range' }
];

export function AttritionDialog({ contracts, teams }: { org: string; contracts: ContractWithProfileAndTeam[]; teams: Tables<'teams'>[] }) {
	const [open, setOpen] = useState(false);
	const [selectedTeamId, setSelectedTeamId] = useState<'all' | number>('all');
	const [gender, setGender] = useState('all');
	const [dateRange, setDateRange] = useState<DateRange | undefined>();

	// Track which filters are active and which is open
	const [activeFilters, setActiveFilters] = useState<string[]>([]);
	const [openFilter, setOpenFilter] = useState<string | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	// Show filter when selected from dropdown
	const handleAddFilter = (key: string) => {
		if (!activeFilters.includes(key)) {
			setActiveFilters(prev => [...prev, key]);
			setOpenFilter(key);
		}
		setDropdownOpen(false);
	};

	const handleRemoveFilter = (key: string) => {
		setActiveFilters(filters => filters.filter(f => f !== key));
		if (openFilter === key) setOpenFilter(null);
		if (key === 'team') setSelectedTeamId('all');
		if (key === 'gender') setGender('all');
		if (key === 'dateRange') {
			const { min, max } = getMonthRange(filteredContracts);
			setDateRange({ from: min, to: max });
		}
	};

	// Filter contracts by team
	const filteredContracts = useMemo(() => {
		if (selectedTeamId === 'all') return contracts;
		return contracts.filter(c => c.team?.id === selectedTeamId);
	}, [contracts, selectedTeamId]);

	// Compute min/max month from filtered contracts
	const { min, max } = useMemo(() => getMonthRange(filteredContracts), [filteredContracts]);

	// Set default date range to full available range when dialog opens or contracts/teams change
	useEffect(() => {
		if (open && (!dateRange || !dateRange.from || !dateRange.to)) {
			setDateRange({ from: min, to: max });
		}
	}, [open, min, max, dateRange]);

	const effectiveRange = useMemo(
		() => ({
			start: dateRange?.from || min,
			end: dateRange?.to || max
		}),
		[dateRange, min, max]
	);

	// Process data for chart and summary
	const { data: chartData, summary } = useMemo(
		() => (filteredContracts ? processAttritionData(filteredContracts, effectiveRange.start, effectiveRange.end, gender) : { data: [], summary: { totalHires: 0, totalTerminations: 0, avgAttrition: 0, highest: null, lowest: null } }),
		[filteredContracts, effectiveRange, gender]
	);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" className="gap-2 text-sm">
					Attrition metrics <ChevronRight size={12} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="block max-h-screen w-full max-w-full overflow-y-auto">
				<div className="mx-auto max-w-5xl">
					{contracts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
							<div className="text-sm font-medium">No contract data available.</div>
							<div className="text-sm">Once you add employees, attrition metrics will appear here.</div>

							<AlertDialogCancel asChild>
								<Button variant="secondary" className="!mt-6 gap-2">
									<ChevronLeft size={12} /> Back
								</Button>
							</AlertDialogCancel>
						</div>
					) : (
						<>
							<div className="mb-16 flex items-center gap-6">
								<div className="relative flex items-center gap-3">
									<AlertDialogCancel asChild>
										<Button variant="secondary" size="icon" className="absolute -left-12 z-10 w-9 rounded-full">
											<ChevronLeft size={12} className="scale-125" />
										</Button>
									</AlertDialogCancel>

									<AlertDialogTitle>Attrition metrics</AlertDialogTitle>

									<AlertDialogDescription className="sr-only">View the attrition metrics for your organization.</AlertDialogDescription>
								</div>

								{/* Filters Row */}
								<div className="flex flex-wrap items-end gap-4">
									{activeFilters.map(filter => {
										if (filter === 'team')
											return (
												<div key={filter} className="relative">
													<Select
														defaultOpen={selectedTeamId === 'all'}
														value={selectedTeamId === 'all' ? 'all' : String(selectedTeamId)}
														onValueChange={v => {
															setSelectedTeamId(v === 'all' ? 'all' : Number(v));
															setOpenFilter(null);
														}}>
														<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
															<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
																<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Team</div>
																<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2')}>
																	<SelectValue placeholder="All Teams" />
																	<div className="h-3 w-3"></div>
																</div>
															</div>
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="all">All Teams</SelectItem>
															{teams.map(team => (
																<SelectItem key={team.id} value={String(team.id)}>
																	{team.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<button onClick={() => handleRemoveFilter('team')} className="absolute right-3 top-1/2 -translate-y-1/2">
														<CircleX size={12} />
													</button>
												</div>
											);

										if (filter === 'gender')
											return (
												<div key={filter} className="relative">
													<Select
														defaultOpen={gender === 'all'}
														value={gender}
														onValueChange={v => {
															setGender(v);
															setOpenFilter(null);
														}}>
														<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
															<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
																<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Gender</div>
																<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2')}>
																	<SelectValue placeholder="Gender" />
																	<div className="h-3 w-3"></div>
																</div>
															</div>
														</SelectTrigger>
														<SelectContent>
															{GENDER_OPTIONS.map(opt => (
																<SelectItem key={opt.value} value={opt.value}>
																	{opt.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<button onClick={() => handleRemoveFilter('gender')} className="absolute right-3 top-1/2 -translate-y-1/2">
														<CircleX size={12} />
													</button>
												</div>
											);

										if (filter === 'dateRange')
											return (
												<div key={filter} className="relative">
													<DatePickerWithRange defaultOpen selected={dateRange} onSetDate={setDateRange}>
														<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
															<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Date Range</div>
															<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2')}>
																<span>{dateRange?.from ? format(dateRange.from, 'LLL dd, y') : ''}</span>-<span>{dateRange?.to ? format(dateRange.to, 'LLL dd, y') : ''}</span>
																<div className="h-3 w-3"></div>
															</div>
														</div>
													</DatePickerWithRange>
													<button onClick={() => handleRemoveFilter('dateRange')} className="absolute right-3 top-1/2 -translate-y-1/2">
														<CircleX size={12} />
													</button>
												</div>
											);
									})}

									{/* Custom Filter Dropdown */}
									<div className="relative">
										<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
											<DropdownMenuTrigger asChild>
												<Button variant="secondary" disabled={activeFilters.length === 3} className="gap-3 rounded-full">
													<Plus size={12} />
													{activeFilters.length > 0 ? '' : 'Add Filter'}
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent align="start" onCloseAutoFocus={e => e.preventDefault()}>
												<DropdownCategoryTitle>
													<span className="font-light text-muted-foreground">Available Filters</span>
												</DropdownCategoryTitle>
												{FILTERS.filter(f => !activeFilters.includes(f.key)).map(f => (
													<DropdownMenuItem key={f.key} onClick={() => handleAddFilter(f.key)}>
														{f.label}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</div>

							{/* Summary */}
							<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
								<div className="">
									<div className="text-2xl font-bold">
										<NumberFlow isolate value={Number(summary.avgAttrition.toFixed(1))} trend={0} />%
									</div>
									<div className="text-xs text-muted-foreground">Avg. Attrition Rate</div>
								</div>

								<div className="">
									<div className="text-2xl font-bold">
										<NumberFlow isolate value={Number(summary.totalTerminations.toFixed(1))} trend={0} />
									</div>
									<div className="text-xs text-muted-foreground">Employees Left</div>
								</div>

								<div className="">
									<div className="text-2xl font-bold">
										<NumberFlow isolate value={Number(summary.totalHires.toFixed(1))} trend={0} />
									</div>
									<div className="text-xs text-muted-foreground">Employees Joined</div>
								</div>
							</div>

							{/* Bar Chart */}
							<div className="mb-8 rounded-lg" style={{ height: 300 }}>
								<ChartContainer
									style={{ width: '100%', height: '100%' }}
									config={{
										attritionRate: { label: 'Attrition Rate (%)', color: '#111' },
										hires: { label: 'New Hires', color: '#555' },
										terminations: { label: 'Terminations', color: '#bbb' }
									}}>
									<BarChart data={chartData} barSize={8} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
										<XAxis dataKey="month" tickLine={true} axisLine={true} />
										<ChartTooltip cursor={false} content={<ChartTooltipContent className="min-w-52" />} />
										<Bar yAxisId="left" dataKey="attritionRate" fill="#111" name="Attrition Rate (%)" />
										<Bar yAxisId="left" dataKey="hires" fill="#555" name="New Hires" />
										<Bar yAxisId="left" dataKey="terminations" fill="#bbb" name="Terminations" />
									</BarChart>
								</ChartContainer>
							</div>

							{/* Details for highest/lowest months */}
							<div className="flex flex-col gap-4 md:flex-row md:justify-between">
								<div className="space-y-4">
									{summary.highest ? (
										<>
											<div className="mb-2 text-sm">Month with Highest Attrition: {summary.highest.month}</div>

											<div className="flex flex-row gap-4">
												<div className="text-xs">
													<span className="text-muted-foreground">Attrition Rate:</span> {summary.highest.attritionRate.toFixed(1)}%
												</div>
												<div className="text-xs">
													<span className="text-muted-foreground">New Hires:</span> {summary.highest.hires.toFixed(1)}
												</div>
												<div className="text-xs">
													<span className="text-muted-foreground">Terminations:</span> {summary.highest.terminations.toFixed(1)}
												</div>
											</div>
										</>
									) : (
										<div className="text-xs">-</div>
									)}
								</div>

								<Separator orientation="vertical" />

								<div className="space-y-4">
									{summary.lowest ? (
										<>
											<div className="mb-2 text-sm">Month with Lowest Attrition: {summary.lowest.month}</div>

											<div className="flex flex-row gap-4">
												<div className="text-xs">
													<span className="text-muted-foreground">Attrition Rate:</span> {summary.lowest.attritionRate.toFixed(1)}%
												</div>
												<div className="text-xs">
													<span className="text-muted-foreground">New Hires:</span> {summary.lowest.hires.toFixed(1)}
												</div>
												<div className="text-xs">
													<span className="text-muted-foreground">Terminations:</span> {summary.lowest.terminations.toFixed(1)}
												</div>
											</div>
										</>
									) : (
										<div className="text-xs">-</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
