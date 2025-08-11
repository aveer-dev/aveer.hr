create type "public"."appraisal_type" as enum ('objectives_goals_accessment', 'direct_score');

alter table "public"."chat_messages" drop constraint "chat_messages_role_check";

alter table "public"."message_feedback" drop constraint "message_feedback_feedback_type_check";

alter table "public"."appraisal_answers" add column "direct_score" jsonb;

alter table "public"."appraisal_answers" add column "manager_direct_score" jsonb;

alter table "public"."appraisal_cycles" add column "type" appraisal_type not null default 'objectives_goals_accessment'::appraisal_type;

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";


