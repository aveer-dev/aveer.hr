create policy "Give users authenticated access to folder flreew_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder flreew_1"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder flreew_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder flreew_3"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text)));



