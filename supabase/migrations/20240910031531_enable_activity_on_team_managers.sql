alter table "public"."managers" drop constraint "managers_role_fkey";

alter table "public"."contracts" add column "team" bigint;

alter table "public"."contracts" add constraint "contracts_team_fkey" FOREIGN KEY (team) REFERENCES teams(id) ON UPDATE CASCADE not valid;

alter table "public"."contracts" validate constraint "contracts_team_fkey";

alter table "public"."managers" add constraint "managers_role_fkey1" FOREIGN KEY (role) REFERENCES team_roles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."managers" validate constraint "managers_role_fkey1";

create policy "Enable all for authenticated users only"
on "public"."managers"
as permissive
for all
to authenticated
using (true);


create policy "Enable all for authenticated users only"
on "public"."teams"
as permissive
for all
to authenticated
using (true);



