import { Button } from '@/components/ui/button';
import { atcb_action, ATCBActionEventConfig } from 'add-to-calendar-button/unstyle';
import { addMinutes, format } from 'date-fns';
import { Tables } from '@/type/database.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ReminderSync = ({ reminder }: { reminder: Tables<'reminders'> }) => {
	const syncToCalendar = (calendarPlatform: ATCBActionEventConfig['options']) => {
		atcb_action({
			name: reminder?.title,
			description: reminder?.description as string,
			startDate: format(new Date(reminder?.datetime as string), 'yyyy-MM-dd'),
			startTime: format(new Date(reminder?.datetime as string), 'HH:mm'),
			endTime: format(addMinutes(new Date(reminder?.datetime as string), 30), 'HH:mm'),
			options: calendarPlatform,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
		});
	};

	return (
		<section className="py-4">
			<h2 className="text-xs font-light text-support">Sync with your preferred calendar for reminder notification</h2>

			<div className="mt-4 space-x-4 text-foreground">
				<Button type="button" variant={'outline'} className="gap-2" onClick={() => syncToCalendar(['Google'])}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 512 512">
						<path d="M473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 01-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 155.6c43.51 44.92 105.13 68.4 168.58 68.4 57.73 0 112.45-22.62 151.45-63.66 38.34-40.4 58.17-96.3 58.17-154.9 0-24.67-2.48-39.32-2.59-39.96z" />
					</svg>
					Google Calendar
				</Button>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="button" variant={'outline'} className="gap-2" onClick={() => syncToCalendar(['Apple'])}>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 512 512">
									<path d="M349.13 136.86c-40.32 0-57.36 19.24-85.44 19.24-28.79 0-50.75-19.1-85.69-19.1-34.2 0-70.67 20.88-93.83 56.45-32.52 50.16-27 144.63 25.67 225.11 18.84 28.81 44 61.12 77 61.47h.6c28.68 0 37.2-18.78 76.67-19h.6c38.88 0 46.68 18.89 75.24 18.89h.6c33-.35 59.51-36.15 78.35-64.85 13.56-20.64 18.6-31 29-54.35-76.19-28.92-88.43-136.93-13.08-178.34-23-28.8-55.32-45.48-85.79-45.48z" />
									<path d="M340.25 32c-24 1.63-52 16.91-68.4 36.86-14.88 18.08-27.12 44.9-22.32 70.91h1.92c25.56 0 51.72-15.39 67-35.11 14.72-18.77 25.88-45.37 21.8-72.66z" />
								</svg>
								Apple Calendar
							</Button>
						</TooltipTrigger>

						<TooltipContent>
							<p>Open downloaded file to add to apple calendar</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</section>
	);
};
