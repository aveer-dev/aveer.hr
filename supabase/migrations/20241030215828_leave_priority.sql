alter table "public"."contracts" alter column "paid_leave" set default 0;

alter table "public"."contracts" alter column "probation_period" set default '0'::numeric;

alter table "public"."contracts" alter column "sick_leave" set default 0;

alter table "public"."open_roles" add column "enable_location" boolean not null default true;

alter table "public"."open_roles" add column "enable_voluntary_data" boolean not null default true;

alter table "public"."org_settings" drop column "paid_time_off";

alter table "public"."org_settings" add column "paid_leave" numeric default '20'::numeric;

create policy "Enable insert for authenticated org admin users only"
on "public"."contracts"
as permissive
for insert
to authenticated
with check (( SELECT authorize_role(contracts.org) AS authorize_role));



