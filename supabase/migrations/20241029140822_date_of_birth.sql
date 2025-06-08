alter table "public"."contracts" alter column "end_date" set data type timestamp with time zone using "end_date"::timestamp with time zone;
alter table "public"."contracts" alter column "start_date" set data type timestamp with time zone using "start_date"::timestamp with time zone;
alter table "public"."profiles" add column "date_of_birth" timestamp with time zone;
