create table "public"."calendar_events" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "summary" text not null,
    "description" text,
    "attendees" jsonb not null,
    "start" jsonb not null,
    "end" jsonb not null,
    "recurrence" text,
    "org" text not null,
    "entity" bigint,
    "event_id" text not null,
    "location" text,
    "time_zone" text,
    "meeting_link" text
);
alter table "public"."calendar_events" enable row level security;
CREATE UNIQUE INDEX calendar_events_pkey ON public.calendar_events USING btree (id);
alter table "public"."calendar_events" add constraint "calendar_events_pkey" PRIMARY KEY using index "calendar_events_pkey";
alter table "public"."calendar_events" add constraint "calendar_events_entity_fkey" FOREIGN KEY (entity) REFERENCES legal_entities(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."calendar_events" validate constraint "calendar_events_entity_fkey";
alter table "public"."calendar_events" add constraint "calendar_events_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."calendar_events" validate constraint "calendar_events_org_fkey";
grant delete on table "public"."calendar_events" to "anon";
grant insert on table "public"."calendar_events" to "anon";
grant references on table "public"."calendar_events" to "anon";
grant select on table "public"."calendar_events" to "anon";
grant trigger on table "public"."calendar_events" to "anon";
grant truncate on table "public"."calendar_events" to "anon";
grant update on table "public"."calendar_events" to "anon";
grant delete on table "public"."calendar_events" to "authenticated";
grant insert on table "public"."calendar_events" to "authenticated";
grant references on table "public"."calendar_events" to "authenticated";
grant select on table "public"."calendar_events" to "authenticated";
grant trigger on table "public"."calendar_events" to "authenticated";
grant truncate on table "public"."calendar_events" to "authenticated";
grant update on table "public"."calendar_events" to "authenticated";
grant delete on table "public"."calendar_events" to "service_role";
grant insert on table "public"."calendar_events" to "service_role";
grant references on table "public"."calendar_events" to "service_role";
grant select on table "public"."calendar_events" to "service_role";
grant trigger on table "public"."calendar_events" to "service_role";
grant truncate on table "public"."calendar_events" to "service_role";
grant update on table "public"."calendar_events" to "service_role";
create policy "Only admins can manipulate events"
on "public"."calendar_events"
as permissive
for all
to authenticated
using (true)
with check (( SELECT authorize_role(calendar_events.org) AS authorize_role));
create policy "Users can only view org events"
on "public"."calendar_events"
as permissive
for select
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = calendar_events.org)));
