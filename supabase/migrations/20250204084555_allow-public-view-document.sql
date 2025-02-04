CREATE UNIQUE INDEX documents_link_id_key ON public.documents USING btree (link_id);

alter table "public"."documents" add constraint "documents_link_id_key" UNIQUE using index "documents_link_id_key";

create policy "Allow public to view if document is not private"
on "public"."documents"
as permissive
for select
to public
using (( SELECT (documents.private = false)));



