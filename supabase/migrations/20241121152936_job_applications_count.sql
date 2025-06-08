set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.update_applicants_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE open_roles
    SET applicants = applicants + 1
    WHERE id = NEW.role;
    RETURN NEW;
END;
$function$;
create policy "Policy with table joins"
on "public"."open_roles"
as permissive
for update
to authenticated
using (true);
