alter table "public"."contracts" add column "direct_report" bigint;

alter table "public"."open_roles" add column "direct_report" bigint;

alter table "public"."contracts" add constraint "contracts_direct_report_fkey" FOREIGN KEY (direct_report) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."contracts" validate constraint "contracts_direct_report_fkey";

alter table "public"."open_roles" add constraint "open_roles_direct_report_fkey" FOREIGN KEY (direct_report) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."open_roles" validate constraint "open_roles_direct_report_fkey";


