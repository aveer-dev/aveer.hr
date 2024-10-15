drop policy "Enable all for authenticated users only" on "public"."appraisal_questions";

alter table "public"."roles" drop constraint "roles_name_key";

drop index if exists "public"."roles_name_key";

alter table "public"."appraisal_questions" drop column "options";

alter table "public"."appraisal_questions" drop column "order";

alter table "public"."appraisal_questions" drop column "question";

alter table "public"."appraisal_questions" drop column "required";

alter table "public"."appraisal_questions" drop column "type";

alter table "public"."appraisal_questions" add column "questions" jsonb[] not null;

alter table "public"."profiles_roles" add column "disable" boolean not null default false;

alter table "public"."profiles_roles" alter column "organisation" set not null;

alter table "public"."profiles_roles" alter column "role" set data type app_role using "role"::app_role;

alter table "public"."roles" alter column "name" set default 'admin'::app_role;

alter table "public"."roles" alter column "name" set data type app_role using "name"::app_role;

CREATE UNIQUE INDEX roles_nm_key ON public.roles USING btree (name);

alter table "public"."roles" add constraint "roles_nm_key" UNIQUE using index "roles_nm_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$declare
    claims jsonb;
    user_role public.app_role;
    user_role_org text;
  begin
    -- Fetch the user role in the profiles_roles table
    select role, organisation into user_role, user_role_org from public.profiles_roles where profile = (event->>'user_id')::uuid;

    claims := event->'claims';

    -- Set the user role claim
    claims := JSONB_SET(
      claims,
      '{user_role}',
      COALESCE(TO_JSONB(user_role), 'null'::jsonb)
    );

    -- Set the user role organization claim
    claims := JSONB_SET(
      claims,
      '{user_role_org}',
      COALESCE(TO_JSONB(user_role_org), 'null'::jsonb)
    );

    -- Update the 'claims' object in the original event
    event := JSONB_SET(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;$function$
;

grant delete on table "public"."profiles_roles" to "PUBLIC";

grant insert on table "public"."profiles_roles" to "PUBLIC";

grant references on table "public"."profiles_roles" to "PUBLIC";

grant select on table "public"."profiles_roles" to "PUBLIC";

grant trigger on table "public"."profiles_roles" to "PUBLIC";

grant truncate on table "public"."profiles_roles" to "PUBLIC";

grant update on table "public"."profiles_roles" to "PUBLIC";

create policy "Enable delete for auth and admin users"
on "public"."appraisal_questions"
as permissive
for delete
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));


create policy "Enable insert for authenticated admin users only"
on "public"."appraisal_questions"
as permissive
for insert
to authenticated
with check ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));


create policy "Enable read access for all users"
on "public"."appraisal_questions"
as permissive
for select
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org)));


create policy "Enable update for auth and admin users"
on "public"."appraisal_questions"
as permissive
for update
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))))
with check ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));



