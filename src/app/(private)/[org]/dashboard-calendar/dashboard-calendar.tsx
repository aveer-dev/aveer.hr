'use client';

import { DayOfWeek, DayPicker } from 'react-day-picker';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, getDay, getYear, isFirstDayOfMonth, isSameDay, isThisMonth, isToday, setYear } from 'date-fns';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LeaveReview } from '@/components/leave/leave-review';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavLink } from '@/components/ui/link';

interface props {
	org: string;
	leaveDays: { date: Date; status: string; name: string; data: any }[];
	birthdays: { id: number; job_title: string; profile: { id: string; last_name: string; first_name: string; date_of_birth: string | null } | null }[];
}

export const Calendar = ({ leaveDays, birthdays, org }: props) => {
	const dayOfWeekMatcher: DayOfWeek = {
		dayOfWeek: [0, 6]
	};

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	return (
		<DayPicker
			className="mb-28"
			classNames={{
				month_caption: 'flex pt-1 relative items-center border-b mb-8 pb-3',
				caption_label: 'text-xl font-bold',
				nav: 'relative bg-transparent p-0 space-x-1 flex items-center justify-end -mb-9 z-[1]',
				button_previous: cn(buttonVariants({ variant: 'ghost' }), ''),
				button_next: cn(buttonVariants({ variant: 'ghost' }), ''),
				today: '!bg-primary text-primary-foreground',
				disabled: 'text-muted-foreground opacity-50',
				hidden: 'hidden'
			}}
			modifiers={{
				weekend: dayOfWeekMatcher,
				leaveDay: leaveDays.map(day => day.date)
			}}
			components={{
				Chevron: ({ orientation }) => (orientation == 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />),
				MonthGrid: ({ children, className, ...props }) => {
					useEffect(() => {
						if (isThisMonth(props['aria-label'] as string)) {
							return document.querySelector('#today')?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
						}

						document.querySelector('#start-of-month')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
					}, [props]);

					return (
						<div className="relative">
							<div
								className={cn(
									className,
									'no-scrollbar flex items-center gap-2 overflow-auto px-10 before:absolute before:bottom-0 before:left-0 before:top-0 before:z-10 before:w-10 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:bottom-0 after:right-0 after:top-0 after:z-10 after:w-10 after:bg-gradient-to-l after:from-background after:to-transparent'
								)}
								{...props}>
								{children}
							</div>
						</div>
					);
				},
				Weekdays: () => <></>,
				Weeks: ({ children }) => <>{children}</>,
				Week: ({ children }) => <>{children}</>,
				Day: ({ children, className, day: { date }, modifiers, ...props }) => {
					const _isToday = isToday(date);
					const isStartOfMonth = isFirstDayOfMonth(date);
					const year = getYear(date);
					const isBirthday = birthdays.filter(birthday => (birthday.profile?.date_of_birth ? isSameDay(date, setYear(birthday.profile?.date_of_birth, year)) : false));
					const dateHasEvent = (modifiers.leaveDay && !modifiers.weekend) || !!isBirthday.length;
					const dayLeaves = leaveDays.filter(leaveDay => isSameDay(leaveDay.date, date));

					return (
						<Popover>
							<PopoverTrigger asChild>
								<button aria-label={props['aria-label']} data-day={(props as any)['data-day']} id={_isToday ? 'today' : isStartOfMonth ? 'start-of-month' : ''} className={cn(className, 'min-h-[132px] min-w-20 space-y-4 rounded-2xl bg-muted py-6 text-center')}>
									<div className="text-sm">{days[getDay(date)]}</div>
									<div className="text-lg font-bold">{children}</div>
									{dateHasEvent && (
										<div className={cn('relative mx-auto h-1 w-4 rounded-md bg-blue-300')}>
											<div className={cn('absolute bottom-0 left-0 top-0 rounded-md bg-green-300', modifiers.leaveDay && !!isBirthday.length && 'w-1/2', modifiers.leaveDay && !isBirthday.length && 'w-full')}></div>
										</div>
									)}
								</button>
							</PopoverTrigger>

							<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-h-52 max-w-64 space-y-4 overflow-y-auto px-2 py-4" side="right">
								{dateHasEvent && (
									<>
										<h3 className="text-sm font-medium">{format(date, 'PP')}</h3>

										<Tabs defaultValue={!modifiers.weekend && !!dayLeaves.length && !!isBirthday.length ? 'leave' : !modifiers.weekend && !!dayLeaves.length ? 'leave' : 'birthday'} className="w-[400px]">
											{!modifiers.weekend && !!dayLeaves.length && !!isBirthday.length && (
												<TabsList className="mb-4 flex h-fit w-fit p-0.5">
													{!modifiers.weekend && !!dayLeaves.length && (
														<TabsTrigger className="py-1" value="leave">
															Leaves
														</TabsTrigger>
													)}
													{!!isBirthday.length && (
														<TabsTrigger className="py-1" value="birthday">
															Bithdays
														</TabsTrigger>
													)}
												</TabsList>
											)}

											{!modifiers.weekend && !!dayLeaves.length && (
												<TabsContent value="leave">
													{dayLeaves.map((leave, index) => (
														<LeaveReview hideTooltip reviewType="admin" data={leave.data} key={index + 'leave'} className={cn('max-w-56', modifiers.outside && 'opacity-10')}>
															{leave?.name}
														</LeaveReview>
													))}
												</TabsContent>
											)}

											{!!isBirthday.length && (
												<TabsContent value="birthday">
													<ul className="space-y-1">
														{isBirthday.map(birthday => (
															<li className="2 max-w-56 text-xs" key={birthday.id}>
																<NavLink className="flex items-center gap-2 rounded-sm p-1 py-2 transition-all duration-300 hover:bg-muted" org={org} href={`/people/${birthday?.id}`}>
																	🎉 {birthday.profile?.first_name}&apos;s birthday
																	<ArrowUpRight size={12} />
																</NavLink>
															</li>
														))}
													</ul>
												</TabsContent>
											)}
										</Tabs>
									</>
								)}

								{!dateHasEvent && <p className="text-xs italic text-muted-foreground">No events</p>}
							</PopoverContent>
						</Popover>
					);
				}
			}}
			autoFocus
		/>
	);
};
