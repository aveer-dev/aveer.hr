alter table "public"."profiles" alter column "date_of_birth" set data type timestamp without time zone using "date_of_birth"::timestamp without time zone;
