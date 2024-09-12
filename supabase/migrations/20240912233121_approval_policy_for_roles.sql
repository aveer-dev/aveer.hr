alter type "public"."policy_types" rename to "policy_types__old_version_to_be_dropped";

create type "public"."policy_types" as enum ('time_off', 'role_application');

alter table "public"."approval_policies" alter column type type "public"."policy_types" using type::text::"public"."policy_types";

drop type "public"."policy_types__old_version_to_be_dropped";

alter table "public"."job_applications" add column "levels" jsonb[] not null default '{}'::jsonb[];

alter table "public"."open_roles" add column "policy" bigint;

alter table "public"."open_roles" add constraint "open_roles_policy_fkey" FOREIGN KEY (policy) REFERENCES approval_policies(id) ON UPDATE CASCADE not valid;

alter table "public"."open_roles" validate constraint "open_roles_policy_fkey";

create policy "Enable delete for authenticated users only"
on "public"."approval_policies"
as permissive
for delete
to authenticated
using (true);



