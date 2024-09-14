'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { DatePicker } from '@/components/ui/date-picker';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export const ScheduleTermination = ({ job_title, first_name, formAction }: { job_title: string; first_name: string; formAction: (date: Date) => Promise<string> }) => {
	const [drawerIsOpen, toggleDrawerState] = useState(false);
	const [terminationDate, setTerminationDate] = useState<Date>();

	const signContract = async () => {
		if (!terminationDate) return;

		const error = await formAction(terminationDate);
		if (error) return toast.error(error);
		toggleDrawerState(false);
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || !terminationDate} size={'sm'} className="px-8 text-xs font-light">
				{pending ? 'Scheduling termination...' : 'Schedule termination'}
			</Button>
		);
	};

	return (
		<Drawer open={drawerIsOpen} onOpenChange={toggleDrawerState}>
			<DrawerTrigger asChild>
				<Button size={'sm'} variant={'ghost'} className="w-full justify-start gap-2 px-4 py-2 focus:!ring-0">
					<CalendarClock size={12} />
					Schedule Termination
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<form className="mx-auto my-8 w-full max-w-sm" action={signContract}>
					<DrawerHeader>
						<DrawerTitle>Schedule Contract Termination</DrawerTitle>
						<DrawerDescription className="mt-1 text-xs font-light">{`Select the date you'd want ${first_name}'s contract as a ${job_title} to be automatically terminated`}</DrawerDescription>
					</DrawerHeader>

					<div className="m-4">
						<DatePicker selected={terminationDate} onSetDate={setTerminationDate} />
					</div>

					<DrawerFooter className="grid grid-cols-2 gap-4">
						<DrawerClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DrawerClose>

						<SubmitButton />
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
};
