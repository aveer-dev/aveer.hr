alter type "public"."file_type" rename to "file_type__old_version_to_be_dropped";

create type "public"."file_type" as enum ('document', 'storage', 'link');

alter table "public"."files" alter column file_type type "public"."file_type" using file_type::text::"public"."file_type";

drop type "public"."file_type__old_version_to_be_dropped";

alter table "public"."links" add column "folder" integer;

alter table "public"."links" add constraint "links_folder_fkey" FOREIGN KEY (folder) REFERENCES folders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."links" validate constraint "links_folder_fkey";

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


