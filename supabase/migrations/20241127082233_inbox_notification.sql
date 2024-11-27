drop trigger if exists "reminder_notification_insert" on "public"."reminders";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_inbox_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    INSERT INTO public.notifications (
        created_at,
        body,
        org,
        "for",
        title,
        sender_profile,
        link
    )
    VALUES (
        now(),
        'You have a new message from your organisation admin.',
        NEW.org,
        'employee',
        'New Message from Admin',
        NEW.sender_profile,
        '/'
    );

    RETURN NEW;
END;$function$
;

CREATE TRIGGER inbox_insert_trigger AFTER INSERT ON public.inbox FOR EACH ROW EXECUTE FUNCTION notify_inbox_insert();


