import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { PostgrestError } from '@supabase/supabase-js';

export interface ICalendarEventsRepository {
	getById(id: number): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	getAllByOrg(org: string): Promise<{ data: Tables<'calendar_events'>[] | null; error: PostgrestError | null }>;
	getAllWithCalendarsByOrg(org: string): Promise<{ data: (Tables<'calendar_events'> & { calendar: Tables<'calendars'> | null })[] | null; error: PostgrestError | null }>;
	create(payload: TablesInsert<'calendar_events'>): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	update(id: number, payload: TablesUpdate<'calendar_events'>): Promise<{ data: Tables<'calendar_events'> | null; error: PostgrestError | null }>;
	delete(id: number): Promise<{ data: null; error: PostgrestError | null }>;
}
