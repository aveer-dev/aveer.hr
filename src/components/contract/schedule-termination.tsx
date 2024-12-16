'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from '../ui/calendar';
import { LoadingSpinner } from '../ui/loader';

export const ScheduleTermination = ({ job_title, first_name, serverAction }: { job_title: string; first_name: string; serverAction: (prev: any, date: Date) => Promise<string> }) => {
	const [drawerIsOpen, toggleDrawerState] = useState(false);
	const [terminationDate, setTerminationDate] = useState<Date>();
	const [state, formAction, pending] = useActionState(serverAction, '');

	useEffect(() => {
		if (state) {
			toast.error(state);
			toggleDrawerState(false);
		}
	}, [state]);

	return (
		<Drawer open={drawerIsOpen} onOpenChange={toggleDrawerState}>
			<DrawerTrigger asChild>
				<Button size={'sm'} variant={'ghost'} className="w-full justify-start gap-2 px-4 py-2 focus:!ring-0">
					<CalendarClock size={12} />
					Schedule Termination
				</Button>
			</DrawerTrigger>

			<DrawerContent>
				<form
					className="mx-auto my-8 w-full max-w-sm"
					action={() => {
						if (!terminationDate) return;
						formAction(terminationDate as Date);
					}}>
					<DrawerHeader>
						<DrawerTitle>Schedule Contract Termination</DrawerTitle>
						<DrawerDescription className="mt-1 text-xs font-light">{`Select the date you'd want ${first_name}'s contract as a ${job_title} to be automatically terminated`}</DrawerDescription>
					</DrawerHeader>

					<div className="m-4">
						<Calendar
							mode="single"
							className="p-0"
							selected={terminationDate}
							onSelect={event => {
								if (event) setTerminationDate(event);
							}}
							autoFocus
						/>
					</div>

					<DrawerFooter className="grid grid-cols-2 gap-4">
						<DrawerClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DrawerClose>

						<Button type="submit" disabled={pending || !terminationDate} size={'sm'} className="gap-2 px-8 text-xs font-light">
							{pending && <LoadingSpinner />}
							{pending ? 'Scheduling termination...' : 'Schedule termination'}
						</Button>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
};
