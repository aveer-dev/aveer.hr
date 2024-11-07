alter table "public"."notifications" alter column "sender_contract" drop not null;

alter table "public"."notifications" alter column "sender_profile" drop not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_time_off_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    INSERT INTO public.notifications (created_at, body, "for", org, title, contracts, link)
    VALUES (now(),
            'The status of your leave request has been updated to ' || NEW.status,
            'employee',
            NEW.org,
            'Leave request update',
            array[NEW.contract],
            '/' || NEW.org || '/' || NEW.contract || '/leave');
    RETURN NEW;
END;$function$
;

CREATE TRIGGER time_off_update_trigger AFTER UPDATE ON public.time_off FOR EACH ROW EXECUTE FUNCTION notify_time_off_update();


