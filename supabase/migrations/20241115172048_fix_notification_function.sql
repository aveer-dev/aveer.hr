drop policy "Enable insert for org's ad users only" on "public"."notifications";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.notify_time_off_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    INSERT INTO public.notifications (created_at, body, "for", org, title, sender_profile, sender_contract, link)
    VALUES (now(), 
            'One of your employees has just request for a time off. Open notification to review leave request details. From "'||TO_CHAR(NEW."from", 
'Day, DD Month YYYY')||'" to "'||TO_CHAR(NEW."to", 
'Day, DD Month YYYY')||'"', 
            'admin',
            NEW.org,
            'New Leave Request',
            NEW.profile,
            New.contract,
            '/time-off');
    RETURN NEW;
END;$function$;
create policy "Enable insert for org's users only"
on "public"."notifications"
as permissive
for insert
to authenticated
with check (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = notifications.org)));
