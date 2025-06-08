alter table "public"."job_applications" alter column "race_ethnicity" drop not null;
alter table "public"."job_applications" alter column "require_sponsorship" drop not null;
alter table "public"."job_applications" alter column "state_location" drop not null;
alter table "public"."job_applications" alter column "work_authorization" drop not null;
