alter table "public"."chat_messages" drop constraint "chat_messages_role_check";

alter table "public"."message_feedback" drop constraint "message_feedback_feedback_type_check";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_org_settings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.organisation)
    ON CONFLICT (org) DO NOTHING;
    RETURN NEW;
END;$function$
;


