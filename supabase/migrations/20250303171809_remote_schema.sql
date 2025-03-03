drop policy "Users can only view org events" on "public"."calendar_events";

drop policy "Org members can select contract" on "public"."contracts";

drop policy "Enable delete for authenticated users only" on "public"."time_off";

drop policy "Enable insert for authenticated users only" on "public"."time_off";

drop policy "Enable read access to org's data for auth users" on "public"."time_off";

drop policy "Enable update for auth users" on "public"."time_off";

create policy "Users can only view org events"
on "public"."calendar_events"
as permissive
for select
to authenticated
using (true);


create policy "Org members can select contract"
on "public"."contracts"
as permissive
for select
to authenticated
using (true);


create policy "Enable delete for authenticated users only"
on "public"."time_off"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."time_off"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access to org's data for auth users"
on "public"."time_off"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for auth users"
on "public"."time_off"
as permissive
for update
to authenticated
using (true)
with check (true);



