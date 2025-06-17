import { ICalendarEventsRepository } from '../interfaces/calendar-events.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class CalendarEventsRepository implements ICalendarEventsRepository {
	async getById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*').eq('org', org);
		return { data, error };
	}
	async create(payload: TablesInsert<'calendar_events'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').insert(payload).select().single();
		return { data, error };
	}
	async update(id: number, payload: TablesUpdate<'calendar_events'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async delete(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('calendar_events').delete().eq('id', id);
		return { data: null, error };
	}
	async getAllWithCalendarsByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*, calendar:calendars!calendar_events_calendar_id_fkey(*)').eq('org', org);
		return { data, error };
	}
}
