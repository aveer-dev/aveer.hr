create policy "Allow employees to update read state"
on "public"."inbox"
as permissive
for update
to authenticated
using (( SELECT ((auth.jwt() ->> 'user_role_org'::text) = inbox.org)));
