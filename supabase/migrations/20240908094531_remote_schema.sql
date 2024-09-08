create policy "update_own_profile_policy"
on "public"."profiles"
as permissive
for update
to public
using ((id = auth.uid()));



