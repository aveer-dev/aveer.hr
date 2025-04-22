-- drop policy "Only allow org admins to update" on "public"."contracts";

-- alter table "public"."roles" alter column "name" drop default;

-- alter type "public"."app_role" rename to "app_role__old_version_to_be_dropped";

-- create type "public"."app_role" as enum ('admin', 'roles_manager');

-- alter table "public"."profiles_roles" alter column role type "public"."app_role" using role::text::"public"."app_role";

-- alter table "public"."roles" alter column name type "public"."app_role" using name::text::"public"."app_role";

-- alter table "public"."roles" alter column "name" set default 'admin'::app_role;

-- drop type "public"."app_role__old_version_to_be_dropped";

-- create policy "Only allow org admins to update"
-- on "public"."contracts"
-- as permissive
-- for update
-- to authenticated
-- using (true);



