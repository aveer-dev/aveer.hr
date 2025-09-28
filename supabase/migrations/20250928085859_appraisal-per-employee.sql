alter table "public"."chat_messages" drop constraint "chat_messages_role_check";

alter table "public"."message_feedback" drop constraint "message_feedback_feedback_type_check";

alter table "public"."appraisal_cycles" alter column "type" drop default;

alter type "public"."appraisal_type" rename to "appraisal_type__old_version_to_be_dropped";

create type "public"."appraisal_type" as enum ('objectives_goals_accessment', 'direct_score', 'per_employee');

alter table "public"."appraisal_cycles" alter column type type "public"."appraisal_type" using type::text::"public"."appraisal_type";

alter table "public"."appraisal_cycles" alter column "type" set default 'objectives_goals_accessment'::appraisal_type;

drop type "public"."appraisal_type__old_version_to_be_dropped";

alter table "public"."appraisal_cycles" add column "employee" bigint;

alter table "public"."appraisal_cycles" add constraint "appraisal_cycles_employee_fkey" FOREIGN KEY (employee) REFERENCES contracts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."appraisal_cycles" validate constraint "appraisal_cycles_employee_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";


