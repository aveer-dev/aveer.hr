drop policy "Org members can select contract" on "public"."contracts";
create policy "Org members can select contract"
on "public"."contracts"
as permissive
for select
to authenticated
using (true);
