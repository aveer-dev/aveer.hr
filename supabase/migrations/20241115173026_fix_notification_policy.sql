drop policy "Enable insert for authenticated users only" on "public"."okrs";
drop policy "Enable insert for org's users only" on "public"."notifications";
create policy "Enable insert for authenticated admin users only"
on "public"."okrs"
as permissive
for insert
to authenticated
with check (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = okrs.org)));
create policy "Enable insert for org's users only"
on "public"."notifications"
as permissive
for insert
to authenticated
with check (true);
