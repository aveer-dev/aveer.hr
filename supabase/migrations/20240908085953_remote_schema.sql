alter table "public"."profiles" drop column "contact";

alter table "public"."profiles" add column "address" jsonb;

alter table "public"."profiles" add column "mobile" text;


