alter table "public"."documents" add column "version" text;


set check_function_bodies = off;

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
AS $function$
BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.subdomain);

    RETURN NEW;
END;
$function$
;


