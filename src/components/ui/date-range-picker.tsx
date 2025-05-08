'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePickerWithRange({ className, onSetDate, selected, defaultOpen, children }: React.HTMLAttributes<HTMLDivElement> & { onSetDate: (date: DateRange) => void; selected: DateRange | undefined; defaultOpen?: boolean; children?: React.ReactNode }) {
	const [date, setDate] = React.useState<DateRange | undefined>(selected);

	const handleDateChange = (date?: DateRange) => {
		setDate(date);
		if (date) onSetDate(date);
	};

	return (
		<div className={cn('grid gap-2', className)}>
			<Popover defaultOpen={defaultOpen}>
				{children ? (
					<PopoverTrigger>{children}</PopoverTrigger>
				) : (
					<PopoverTrigger asChild>
						<Button id="date" variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
							{date?.from ? (
								date.to ? (
									<>
										{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
									</>
								) : (
									format(date.from, 'LLL dd, y')
								)
							) : (
								<span>Pick a date</span>
							)}
							<CalendarIcon size={14} className="ml-auto text-muted-foreground" />
						</Button>
					</PopoverTrigger>
				)}
				<PopoverContent className="w-auto" align="start">
					<Calendar
						classNames={{
							months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative',
							dropdowns: 'w-fit flex items-center justify-center gap-2',
							dropdown_root: '[&>span>svg]:hidden',
							button_next: cn(buttonVariants({ variant: 'outline' }), 'w-7 p-0 h-7 absolute right-1 top-0'),
							button_previous: cn(buttonVariants({ variant: 'outline' }), 'w-7 p-0 h-7 absolute left-1 top-0')
						}}
						autoFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={handleDateChange}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
