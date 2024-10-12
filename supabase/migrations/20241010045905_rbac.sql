create type "public"."app_role" as enum ('admin');

create sequence "public"."boaring_check_list_id_seq";

drop policy "Enable all for authenticated users only" on "public"."okrs";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.authorize_role(org_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$DECLARE
  bind_role int;
  user_role public.app_role;
  user_role_org text;
BEGIN
  -- Fetch user role once and store it to reduce number of calls
  SELECT (auth.jwt() ->> 'user_role')::public.app_role INTO user_role;
  SELECT (auth.jwt() ->> 'user_role_org')::text INTO user_role_org;

  -- Check if user_role_org is null or does not match org_name
  IF user_role_org IS NULL OR LOWER(user_role_org) != LOWER(org_name) THEN
    RETURN false;
  ELSE
    SELECT COUNT(*)
    INTO bind_role
    FROM public.profiles_roles
    WHERE profiles_roles.organisation = user_role_org
      AND profiles_roles.role = user_role
      AND profiles_roles.profile = auth.uid();

    RETURN bind_role > 0;
  END IF;
END;$function$
;

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
    select role into user_role from public.profiles_roles where profile = (event->>'user_id')::uuid;
    select organisation into user_role_org from public.profiles_roles where profile = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
      claims := jsonb_set(claims, '{user_role_org}', to_jsonb(user_role_org));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
      claims := jsonb_set(claims, '{user_role_org}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;$function$
;


grant delete on table "public"."profiles_roles" to "supabase_auth_admin";

grant insert on table "public"."profiles_roles" to "supabase_auth_admin";

grant references on table "public"."profiles_roles" to "supabase_auth_admin";

grant select on table "public"."profiles_roles" to "supabase_auth_admin";

grant trigger on table "public"."profiles_roles" to "supabase_auth_admin";

grant truncate on table "public"."profiles_roles" to "supabase_auth_admin";

grant update on table "public"."profiles_roles" to "supabase_auth_admin";

create policy "Enable delete for users based on user_id"
on "public"."okrs"
as permissive
for delete
to public
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = okrs.org))));


create policy "Enable insert for authenticated users only"
on "public"."okrs"
as permissive
for insert
to authenticated
with check (( SELECT authorize_role(okrs.org) AS authorize_role));


create policy "Enable users to view their own data only"
on "public"."okrs"
as permissive
for select
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = okrs.org))));


create policy "Allow auth admin to read user roles"
on "public"."profiles_roles"
as permissive
for select
to supabase_auth_admin
using (true);



