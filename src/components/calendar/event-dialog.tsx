import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { EventForm } from './event-form';
import { toast } from 'sonner';
import { getEmployees, getTeams } from '@/utils/form-data-init';

export const EventDialog = ({ reminder, org, calendarId, profile, children, isOpen, onClose }: { onClose?: (state: boolean) => void; isOpen?: boolean; reminder?: Tables<'reminders'>; org: string; calendarId: string; profile: string; children?: ReactNode }) => {
	const [isAddOpen, toggleAdd] = useState(isOpen || false);
	const [employees, setEmployees] = useState<{ id: number; job_title: string; profile: { first_name: string; last_name: string; id: string } }[]>([]);
	const [teams, setTeams] = useState<Tables<'teams'>[]>([]);

	useEffect(() => {
		const onGetEmployees = async () => {
			const [{ data: employeeData, error: employeeError }, { data: teamData, error: teamError }] = await Promise.all([getEmployees({ org }), getTeams({ org })]);
			if (employeeError || teamError) return toast.error(employeeError?.message || teamError?.message);

			setEmployees(employeeData as any[]);
			setTeams(teamData);
		};

		onGetEmployees();
	}, [org]);

	return (
		<AlertDialog
			open={isAddOpen}
			onOpenChange={state => {
				toggleAdd(state);
				onClose && onClose(state)!;
			}}>
			{!children && !reminder && (
				<AlertDialogTrigger asChild>
					<Button variant="ghost">
						<Plus size={16} />
					</Button>
				</AlertDialogTrigger>
			)}

			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

			<AlertDialogContent className="overflow-y-auto">
				<AlertDialogHeader>
					<AlertDialogTitle>Create event</AlertDialogTitle>
					<AlertDialogDescription className="hidden"></AlertDialogDescription>
				</AlertDialogHeader>

				<EventForm
					employeeList={employees as any}
					teamsList={teams}
					calendarId={calendarId}
					onClose={() => {
						toggleAdd(!isAddOpen);
						onClose!(false);
					}}
					org={org}
					profile={profile}
					onCreateEvent={() => {
						toggleAdd(!isAddOpen);
						onClose!(false);
					}}
				/>
			</AlertDialogContent>
		</AlertDialog>
	);
};
