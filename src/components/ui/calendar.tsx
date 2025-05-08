'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(className, '')}
			classNames={{
				months: 'flex flex-col sm:flex-col space-y-4 sm:space-x-4 sm:space-y-0 relative',
				month: 'space-y-4 w-full first-of-type:!ml-0',
				month_caption: 'flex justify-center relative items-center',
				caption_label: 'hidden',
				nav: 'space-x-1 flex items-center w-full z-10 -mb-3',
				nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
				button_previous: cn(buttonVariants({ variant: 'outline' }), 'w-7 p-0 h-7 absolute left-1'),
				button_next: cn(buttonVariants({ variant: 'outline' }), 'w-7 p-0 h-7 absolute right-1'),
				month_grid: 'w-full border-collapse space-y-1',
				weekdays: 'flex',
				weekday: 'text-muted-foreground rounded-md w-full min-w-9 font-normal text-[0.8rem]',
				week: 'flex w-full mt-2',
				day: 'group h-9 w-full min-w-9 text-center text-sm p-0 relative aria-selected:[&.range-start]:rounded-l-md aria-selected:[&.range-end]:rounded-r-md aria-selected:[&.day-outside]:bg-accent/50 aria-selected:bg-accent first:aria-selected:rounded-l-md last:aria-selected:rounded-r-md focus-within:relative focus-within:z-20',
				day_button: cn(
					buttonVariants({ variant: 'ghost' }),
					'group-aria-selected:text-primary-foreground group-aria-selected:bg-primary group-[&.range-middle]:!text-foreground group-[&.range-middle]:!bg-accent group-[&.range-end]:text-primary-foreground group-[&.range-end]:bg-primary group-[&.range-start]:text-primary-foreground group-[&.range-start]:bg-primary group-aria-selected:hover:bg-primary group-aria-selected:hover:text-primary-foreground group-aria-selected:focus:bg-primary group-aria-selected:focus:text-primary-foreground group-[.day-outside]:opacity-50 group-aria-selected:[&.day-outside]:opacity-30 h-9 w-full min-w-9 p-0 font-normal aria-selected:opacity-100  hover:bg-primary hover:text-primary-foreground'
				),
				range_end: 'range-end',
				range_start: 'range-start',
				today: 'bg-accent text-accent-foreground',
				outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
				disabled: 'text-muted-foreground opacity-50',
				range_middle: 'range-middle aria-selected:bg-accent aria-selected:text-accent-foreground',
				hidden: 'invisible',
				dropdown: 'text-sm w-fit',
				years_dropdown: 'ml-3',
				...classNames
			}}
			components={{
				Chevron: ({ orientation }) => (orientation == 'left' ? <ChevronLeft size={12} /> : <ChevronRight size={12} />)
			}}
			captionLayout="dropdown"
			{...props}
		/>
	);
}
Calendar.displayName = 'Calendar';

export { Calendar };
