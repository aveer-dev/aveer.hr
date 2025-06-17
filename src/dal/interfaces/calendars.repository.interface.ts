import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface ICalendarsRepository {
	getCalendarById(id: number): Promise<{ data: Tables<'calendars'> | null; error: PostgrestError | null }>;
	getAllCalendarsByOrg({ org }: { org: string }): Promise<{ data: Tables<'calendars'>[] | null; error: PostgrestError | null }>;
	createCalendar(payload: TablesInsert<'calendars'>): Promise<{ data: Tables<'calendars'> | null; error: PostgrestError | null }>;
	updateCalendar(id: number, payload: TablesUpdate<'calendars'>): Promise<{ data: Tables<'calendars'> | null; error: PostgrestError | null }>;
	deleteCalendar(id: number): Promise<{ data: null; error: PostgrestError | null }>;

	getCalendarEventById(id: number): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	getAllCalendarEventsByOrg(org: string): Promise<{ data: Tables<'calendar_events'>[] | null; error: PostgrestError | null }>;
	createCalendarEvent(payload: TablesInsert<'calendar_events'>): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	updateCalendarEvent(id: number, payload: TablesUpdate<'calendar_events'>): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	deleteCalendarEvent(id: number): Promise<{ data: null; error: PostgrestError | null }>;
}
