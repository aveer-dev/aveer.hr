drop trigger if exists "time_off_insert_trigger" on "public"."time_off";
drop trigger if exists "time_off_update_trigger" on "public"."time_off";
drop policy "Enable all for authenticated users only" on "public"."contracts";
drop policy "Enable read access for auth users" on "public"."time_off";
drop policy "Enable delete for authenticated users only" on "public"."time_off";
drop policy "Enable insert for authenticated users only" on "public"."time_off";
drop policy "Enable update for auth users" on "public"."time_off";
drop function if exists "public"."notify_time_off_insert"();
drop function if exists "public"."notify_time_off_update"();
create policy "Only org members can update contract"
on "public"."contracts"
as permissive
for update
to authenticated
using (true)
with check (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = contracts.org)));
create policy "Org members can select contract"
on "public"."contracts"
as permissive
for select
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = contracts.org)));
create policy "Enable read access to org's data for auth users"
on "public"."time_off"
as permissive
for select
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = time_off.org)));
create policy "Enable delete for authenticated users only"
on "public"."time_off"
as permissive
for delete
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = time_off.org)));
create policy "Enable insert for authenticated users only"
on "public"."time_off"
as permissive
for insert
to authenticated
with check (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = time_off.org)));
create policy "Enable update for auth users"
on "public"."time_off"
as permissive
for update
to authenticated
using (true)
with check (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = time_off.org)));
