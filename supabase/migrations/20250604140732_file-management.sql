alter table "public"."files" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."files" alter column "created_at" set not null;

alter table "public"."folders" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."folders" alter column "created_at" set not null;

alter table "public"."folders" alter column "updated_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."folders" alter column "updated_at" set not null;

alter table "public"."question_templates" add column "custom_group_names" jsonb[];

alter table "public"."question_templates" alter column "name" drop not null;

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
AS $function$BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.organisation);

    RETURN NEW;
END;$function$
;


