alter table "public"."time_off" drop constraint "time_off_hand_over_fkey";

alter table "public"."time_off" alter column "hand_over" set data type bigint using "hand_over"::bigint;

alter table "public"."time_off" add constraint "time_off_hand_over_fkey" FOREIGN KEY (hand_over) REFERENCES contracts(id) ON UPDATE CASCADE not valid;

alter table "public"."time_off" validate constraint "time_off_hand_over_fkey";


