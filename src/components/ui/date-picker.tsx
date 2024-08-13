// 'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

export function DatePicker({ onSetDate, selected }: { onSetDate: (date: Date | undefined) => void; selected?: Date }) {
	const [date, setDate] = useState(selected);
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			<PopoverTrigger asChild>
				<Button variant={'outline'} className={cn('flex w-full justify-between border-input bg-input-bg px-3 text-left font-light', !date && 'text-muted-foreground')}>
					{date ? format(date, 'PPP') : <span>Pick a date</span>}
					<CalendarIcon className="mr-2 h-4 w-4" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={event => {
						if (event) {
							toggleOpenState(false);
							setDate(event);
							onSetDate(event);
						}
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
