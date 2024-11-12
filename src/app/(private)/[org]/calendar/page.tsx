import { createClient } from '@/utils/supabase/server';
import { FullCalendar } from './calendar';
import { redirect } from 'next/navigation';

export default async function CalendarPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error || !user) return redirect('/login');

	const [{ data: leaves, error: leaveError }, { data: reminders, error: reminderError }, { data: dobs, error: dobError }] = await Promise.all([
		await supabase.from('time_off').select('*, profile:profiles!time_off_profile_fkey(first_name, last_name)').eq('org', props.params.org).neq('status', 'denied'),
		await supabase.from('reminders').select('*, profile:profiles!reminders_profile_fkey(id, first_name, last_name)').match({ org: props.params.org, profile: user?.id }),
		await supabase.from('contracts').select('id, job_title, profile:profiles!contracts_profile_fkey(first_name, last_name, date_of_birth, id)').eq('org', props.params.org)
	]);

	const result: { date: Date; name: string; status: string; data: any }[] = [];

	for (const item of leaves!) {
		const startDate = new Date(item.from);
		const endDate = new Date(item.to);
		const name = `${item.leave_type} leave | ${item.profile.first_name} ${item.profile.last_name}`;
		const status = item.status;
		const data = item;

		for (let date = startDate as any; date <= endDate; date.setDate(date.getDate() + 1)) result.push({ date: new Date(date), name, status, data });
	}

	return (
		<section className="mx-auto">
			<FullCalendar org={props.params.org} profile={user?.id!} contract={dobs?.find(contract => contract.profile?.id == user?.id)?.id as number} leaveDays={result} reminders={reminders || []} dobs={dobs!.filter(contract => contract.profile?.date_of_birth) as any} />
		</section>
	);
}
