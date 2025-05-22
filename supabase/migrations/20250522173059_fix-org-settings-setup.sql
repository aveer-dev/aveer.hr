drop trigger if exists "trigger_create_org_settings" on "public"."organisations";

drop policy "Enable all for authenticated users only" on "public"."org_settings";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_admin_profile_role()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.profiles_roles (
    organisation,
    role
  )
  VALUES (
    NEW.subdomain,
    'admin'
  );
  RETURN NEW;
END;
$function$
;

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
$function$
;

CREATE OR REPLACE FUNCTION public.create_org_settings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.organisation);

    RETURN NEW;
END;$function$
;

create policy "Enable all for authorized users only"
on "public"."org_settings"
as permissive
for all
to authenticated
using (true)
with check (( SELECT authorize_role(org_settings.org) AS authorize_role));


CREATE TRIGGER create_admin_profile_role_trigger AFTER INSERT ON public.organisations FOR EACH ROW EXECUTE FUNCTION create_admin_profile_role();

CREATE TRIGGER create_org_settings AFTER INSERT ON public.profiles_roles FOR EACH ROW EXECUTE FUNCTION create_org_settings();


