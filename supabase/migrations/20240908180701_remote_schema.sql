grant insert on table "storage"."objects" to PUBLIC;

create policy "Allow public uploads to job-applications"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'job-applications'::text));


create policy "Enable anyone to perform any action  1wwikoj_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'job-applications'::text));


create policy "Enable anyone to perform any action  1wwikoj_1"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'job-applications'::text));


create policy "Enable anyone to perform any action  1wwikoj_2"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'job-applications'::text));



