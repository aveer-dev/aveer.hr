CREATE TRIGGER inbox_push_notification AFTER INSERT ON public.inbox FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/message_push', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


