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
        '/?messages=' || NEW.id
    );

    RETURN NEW;
END;$function$;
