create policy "Only allow org admins to update"
on "public"."contracts"
as permissive
for update
to authenticated
using (( SELECT authorize_role(contracts.org) AS authorize_role));



