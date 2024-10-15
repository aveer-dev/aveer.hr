'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayOfWeek, DayPicker } from 'react-day-picker';
import { LeaveReview } from './leave-review';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface props {
	leaveDays: { date: Date; status: string; name: string; data: any }[];
}

export const LeaveCalendar = ({ leaveDays }: props) => {
	const dayOfWeekMatcher: DayOfWeek = {
		dayOfWeek: [0, 6]
	};

	return (
		<DayPicker
			showOutsideDays
			classNames={{
				months: 'flex flex-col sm:flex-col space-y-4 sm:space-y-0',
				month: 'space-y-4 w-full',
				month_caption: 'flex pt-1 relative items-center border-b mb-12 pb-3',
				caption_label: 'text-xl font-bold',
				nav: 'relative bg-transparent p-0 space-x-1 flex items-center justify-end -mb-9 z-[1]',
				button_previous: cn(buttonVariants({ variant: 'secondary' }), ''),
				button_next: cn(buttonVariants({ variant: 'secondary' }), ''),
				month_grid: 'w-full border-collapse space-y-1',
				weekdays: 'flex',
				weekday: 'text-muted-foreground p-1 w-full min-w-9 font-normal text-[0.8rem] h-16 border-r font-bold last-of-type:border-r-0',
				week: 'flex w-full last-of-type:border-b-0 border-b',
				range_end: 'day-range-end',
				selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
				today: 'bg-accent text-accent-foreground',
				outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
				disabled: 'text-muted-foreground opacity-50',
				range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
				hidden: 'invisible'
			}}
			modifiers={{
				leaveDay: leaveDays.map(day => day.date),
				weekend: dayOfWeekMatcher
			}}
			autoFocus
			components={{
				Chevron: ({ orientation }) => (orientation == 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />),
				Day: props => {
					const { day, modifiers, ...cellProps } = props;
					const dayLeaves = leaveDays.filter(leaveDay => isSameDay(leaveDay.date, day.date));

					return (
						<td
							{...cellProps}
							className="relative h-28 w-full min-w-9 overflow-y-hidden border-r p-1 text-center text-sm last-of-type:border-r-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md">
							<div className={cn((modifiers.outside || modifiers.weekend) && 'opacity-10', modifiers.today && 'bg-slate-800 text-white', 'mb-2 ml-auto flex h-6 w-6 items-center justify-center rounded-full p-1 text-right text-lg')}>{cellProps.children}</div>
							{modifiers.leaveDay &&
								!modifiers.weekend &&
								dayLeaves.slice(0, dayLeaves.length > 3 ? 2 : dayLeaves.length).map((leave, index) => (
									<LeaveReview reviewType="admin" data={leave.data} key={index + 'leave'} className={cn(modifiers.outside && 'opacity-10')}>
										{leave?.name}
									</LeaveReview>
								))}

							{dayLeaves.length > 3 && (
								<Popover>
									<PopoverTrigger asChild>
										<Button type="button" className="mt-1 flex h-fit w-full items-center justify-between px-2 py-px text-xs" variant={'secondary'}>
											View all
											<ChevronRight size={12} />
										</Button>
									</PopoverTrigger>
									<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="max-h-52 max-w-64 space-y-4 overflow-y-auto" side="right">
										<h3 className="text-sm font-medium">{format(day.date, 'PP')}</h3>

										{modifiers.leaveDay &&
											!modifiers.weekend &&
											dayLeaves.slice(0, dayLeaves.length > 3 ? 2 : dayLeaves.length).map((leave, index) => (
												<LeaveReview reviewType="admin" data={leave.data} key={index + 'leave'} className={cn(modifiers.outside && 'opacity-10')}>
													{leave?.name}
												</LeaveReview>
											))}
									</PopoverContent>
								</Popover>
							)}
						</td>
					);
				}
			}}
		/>
	);
};
