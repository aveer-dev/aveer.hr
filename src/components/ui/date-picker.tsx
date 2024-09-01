// 'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { FormControl } from './form';
import { ControllerRenderProps } from 'react-hook-form';

export function DatePicker({ onSetDate, selected, field }: { onSetDate: (date: Date | undefined) => void; selected?: Date; field?: ControllerRenderProps<any> }) {
	const [date, setDate] = useState(selected);
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			<PopoverTrigger asChild>
				<FormControl>
					<Button variant={'outline'} className={cn('flex w-full justify-between border-input bg-input-bg px-3 text-left font-light', (!date || !field?.value) && 'text-muted-foreground')}>
						{field?.value || date ? format(field?.value || date, 'PPP') : <span>Pick a date</span>}
						<CalendarIcon className="mr-2 h-4 w-4" />
					</Button>
				</FormControl>
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
