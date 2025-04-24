create policy "Users can delete appraisal files from their org"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'appraisal-files'::text) AND ((regexp_match(name, '^([^/]+)/.*'::text))[1] IN ( SELECT DISTINCT contracts.org
   FROM contracts
  WHERE (contracts.profile = auth.uid())))));


create policy "Users can read appraisal files from their org"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'appraisal-files'::text) AND ((regexp_match(name, '^([^/]+)/.*'::text))[1] IN ( SELECT DISTINCT contracts.org
   FROM contracts
  WHERE (contracts.profile = auth.uid())))));


create policy "Users can upload appraisal files to their org"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'appraisal-files'::text) AND ((regexp_match(name, '^([^/]+)/.*'::text))[1] IN ( SELECT DISTINCT contracts.org
   FROM contracts
  WHERE (contracts.profile = auth.uid())))));



