import { ICalendarsRepository } from '../interfaces/calendars.repository.interface';
import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';

export class CalendarsRepository implements ICalendarsRepository {
	async getCalendarById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendars').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllCalendarsByOrg({ org }: { org: string }) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendars').select('*').eq('org', org);
		return { data, error };
	}
	async createCalendar(payload: TablesInsert<'calendars'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendars').insert(payload).select().single();
		return { data, error };
	}
	async updateCalendar(id: number, payload: TablesUpdate<'calendars'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendars').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteCalendar(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('calendars').delete().eq('id', id);
		return { data: null, error };
	}
	async getCalendarEventById(id: number) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*').eq('id', id).single();
		return { data, error };
	}
	async getAllCalendarEventsByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*').eq('org', org);
		return { data, error };
	}
	async createCalendarEvent(payload: TablesInsert<'calendar_events'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').insert(payload).select().single();
		return { data, error };
	}
	async updateCalendarEvent(id: number, payload: TablesUpdate<'calendar_events'>) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').update(payload).eq('id', id).select().single();
		return { data, error };
	}
	async deleteCalendarEvent(id: number) {
		const supabase = await createClient();
		const { error } = await supabase.from('calendar_events').delete().eq('id', id);
		return { data: null, error };
	}
	async getAllCalendarEventsWithCalendarsByOrg(org: string) {
		const supabase = await createClient();
		const { data, error } = await supabase.from('calendar_events').select('*, calendar:calendars!calendar_events_calendar_id_fkey(*)').eq('org', org);
		return { data, error };
	}
}
