// 'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ReactNode, useState } from 'react';
import { FormControl } from './form';
import { ControllerRenderProps } from 'react-hook-form';

export function DatePicker({ onSetDate, selected, children, disableButton, field, ...calendarProps }: { children?: ReactNode; disableButton?: boolean; onSetDate: (date: Date) => void; selected?: Date; field?: ControllerRenderProps<any> } & CalendarProps) {
	const [date, setDate] = useState(selected);
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			{field && !children && (
				<PopoverTrigger asChild>
					<FormControl>
						<Button variant={'outline'} disabled={disableButton} className={cn('flex w-full justify-between border-input bg-input-bg px-3 text-left font-light', (!date || !field?.value) && 'text-muted-foreground')}>
							{field?.value || date ? format(field?.value || date, 'PPP') : <span>Pick a date</span>}
							<CalendarIcon className="h-4 w-4" />
						</Button>
					</FormControl>
				</PopoverTrigger>
			)}

			{!field && !children && (
				<PopoverTrigger asChild>
					<Button variant={'outline'} disabled={disableButton} className={cn('flex w-full justify-between border-input bg-input-bg px-3 text-left font-light', !date && 'text-muted-foreground')}>
						{date ? format(date, 'PPP') : <span>Pick a date</span>}
						<CalendarIcon className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
			)}

			{children && <PopoverTrigger asChild>{children}</PopoverTrigger>}

			<PopoverContent className="w-auto pt-8">
				<Calendar
					{...calendarProps}
					mode="single"
					className={cn('p-0')}
					selected={date}
					onSelect={event => {
						if (event) {
							toggleOpenState(false);
							setDate(event);
							onSetDate(event);
						}
					}}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
