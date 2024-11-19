drop policy "Enable read access for admin users" on "public"."profiles";

create policy "Enable read access for admin users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);



