CREATE TRIGGER email_notification AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/email_notification', 'POST', '{"Content-type":"application/json"}', '{}', '5000');

