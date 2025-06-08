alter table "public"."org_settings" add column "enable_task_manager" boolean not null default false;
alter table "public"."org_settings" add column "plane_key" text;
alter table "public"."org_settings" add column "plane_project" text;
alter table "public"."org_settings" add column "plane_workspace_slug" text;
