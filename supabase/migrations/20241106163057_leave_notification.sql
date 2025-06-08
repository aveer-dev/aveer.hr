create type "public"."user_type" as enum ('admin', 'employee');
alter table "public"."notifications" drop column "read_contracts";
alter table "public"."notifications" drop column "type";
alter table "public"."notifications" add column "for" user_type not null;
alter table "public"."notifications" add column "link" text;
alter table "public"."notifications" add column "read" text[] not null default '{}'::text[];
alter table "public"."notifications" add column "sender_contract" bigint not null;
alter table "public"."notifications" add column "sender_profile" uuid not null;
alter table "public"."notifications" add column "title" text not null;
alter table "public"."notifications" alter column "body" set default ''::text;
alter table "public"."notifications" alter column "contracts" drop not null;
alter table "public"."notifications" add constraint "notifications_sender_contract_fkey" FOREIGN KEY (sender_contract) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;
alter table "public"."notifications" validate constraint "notifications_sender_contract_fkey";
alter table "public"."notifications" add constraint "notifications_sender_profile_fkey" FOREIGN KEY (sender_profile) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."notifications" validate constraint "notifications_sender_profile_fkey";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.notify_time_off_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    INSERT INTO public.notifications (created_at, body, "for", org, title, sender_profile, sender_contract, link)
    VALUES (now(), 
            'One of your employees has just request for a time off. Open notification to review leave request details. From ' || NEW."from" || ' to ' || NEW."to", 
            'admin',
            NEW.org,
            'New Leave Request',
            NEW.profile,
            New.contract,
            '/time-off');
    RETURN NEW;
END;$function$;
create policy "Allow only authenticated org members to update"
on "public"."notifications"
as permissive
for update
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = notifications.org)));
create policy "Enable insert for org's ad users only"
on "public"."notifications"
as permissive
for insert
to authenticated
with check (( SELECT authorize_role(notifications.org) AS authorize_role));
create policy "Enable read access for all authenticated users"
on "public"."notifications"
as permissive
for select
to authenticated
using (true);
CREATE TRIGGER time_off_insert_trigger AFTER INSERT ON public.time_off FOR EACH ROW EXECUTE FUNCTION notify_time_off_insert();
