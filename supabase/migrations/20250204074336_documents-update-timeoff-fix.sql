alter table "public"."documents" drop column "editors";

alter table "public"."documents" add column "link_id" uuid not null default gen_random_uuid();

alter table "public"."documents" add column "owner_employee" bigint;

alter table "public"."documents" add column "parent_id" bigint;

alter table "public"."documents" add column "shared_with" jsonb[] not null default '{}'::jsonb[];

alter table "public"."documents" add column "signatures" jsonb[];

alter table "public"."documents" add column "signed_lock" boolean not null default false;

alter table "public"."time_off" alter column "from" set data type date using "from"::date;

alter table "public"."time_off" alter column "to" set data type date using "to"::date;

alter table "public"."documents" add constraint "documents_owner_employee_fkey" FOREIGN KEY (owner_employee) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_owner_employee_fkey";

alter table "public"."documents" add constraint "documents_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES documents(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_parent_id_fkey";

create policy "Only allow employees to work with documents"
on "public"."documents"
as permissive
for all
to authenticated
using (true)
with check (( SELECT check_contract_exists(auth.uid(), documents.owner_employee) AS check_contract_exists));



