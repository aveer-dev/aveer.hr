alter table "public"."open_roles" add column "is_manager" boolean not null default false;

alter table "public"."open_roles" add column "team" bigint;

alter table "public"."open_roles" add constraint "open_roles_team_fkey" FOREIGN KEY (team) REFERENCES teams(id) ON UPDATE CASCADE not valid;

alter table "public"."open_roles" validate constraint "open_roles_team_fkey";

create policy "Enable insert for authenticated users only"
on "public"."approval_policies"
as permissive
for insert
to authenticated
with check (true);



