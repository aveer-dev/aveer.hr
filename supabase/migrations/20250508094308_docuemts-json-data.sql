drop policy "Only admins can work with documents" on "public"."documents";
drop policy "Only allow employees to work with documents" on "public"."documents";
alter table "public"."documents" alter column "json" set data type jsonb using "json"::jsonb;
alter table "public"."org_settings" alter column "maternity_leave" set default '90'::smallint;
alter table "public"."org_settings" alter column "paternity_leave" set default '30'::smallint;
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.check_contract_exists_with_org(p_profile_id uuid, p_org text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
    exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.contracts
        WHERE profile = p_profile_id AND org = p_org
    ) INTO exists;

    RETURN exists;
END;$function$;
CREATE OR REPLACE FUNCTION public.authorize_role(org_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles_roles
    WHERE
      profiles_roles.profile = auth.uid()
      AND profiles_roles.organisation = org_name
      AND profiles_roles.role = 'admin'
      AND profiles_roles.disable = false
  );
$function$;
CREATE OR REPLACE FUNCTION public.create_org_settings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.subdomain);

    RETURN NEW;
END;
$function$;
create policy "Only allow employees to work with documents"
on "public"."documents"
as permissive
for all
to authenticated
using (true)
with check (true);
