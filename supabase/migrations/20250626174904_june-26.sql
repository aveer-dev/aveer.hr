drop policy "Only admins can use calendar tokens" on "public"."calendar_platform_tokens";

alter table "public"."chat_messages" drop constraint "chat_messages_role_check";

alter table "public"."message_feedback" drop constraint "message_feedback_feedback_type_check";

alter table "public"."template_questions" drop constraint "template_questions_template_id_fkey";

alter table "public"."calendar_platform_tokens" add column "profile" uuid;

alter table "public"."calendar_platform_tokens" alter column "org" drop not null;

alter table "public"."calendars" add column "default" boolean not null default false;

alter table "public"."calendars" add column "profile" uuid;

alter table "public"."calendar_platform_tokens" add constraint "calendar_platform_tokens_profile_fkey" FOREIGN KEY (profile) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."calendar_platform_tokens" validate constraint "calendar_platform_tokens_profile_fkey";

alter table "public"."calendars" add constraint "calendars_profile_fkey" FOREIGN KEY (profile) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."calendars" validate constraint "calendars_profile_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";

alter table "public"."template_questions" add constraint "template_questions_template_id_fkey" FOREIGN KEY (template_id) REFERENCES question_templates(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."template_questions" validate constraint "template_questions_template_id_fkey";

create policy "Only auth users can perform actions"
on "public"."calendar_platform_tokens"
as permissive
for all
to authenticated
using (true)
with check (true);



