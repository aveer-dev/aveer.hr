drop policy "Enable insert for org's ad users only" on "public"."notifications";
create policy "Enable insert for org's ad users only"
on "public"."notifications"
as permissive
for insert
to authenticated
with check (true);
CREATE TRIGGER messages_hook AFTER INSERT ON public.inbox FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/message_push', 'POST', '{"Content-type":"application/json"}', '{}', '5000');
CREATE TRIGGER email_notifications AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/email_notification', 'POST', '{"Content-type":"application/json"}', '{}', '5000');
