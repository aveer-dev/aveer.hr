create policy "Give public access to bucket gm7o6w_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'documents-assets'::text));
create policy "Give users authenticated access gm7o6w_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'documents-assets'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users authenticated access gm7o6w_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'documents-assets'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users authenticated access gm7o6w_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'documents-assets'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users authenticated access to folder 1h6xdx7_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'signatures'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users authenticated access to folder 1h6xdx7_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'signatures'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users authenticated access to folder 1h6xdx7_2"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'signatures'::text) AND (auth.role() = 'authenticated'::text)));
