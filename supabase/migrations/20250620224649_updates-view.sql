drop policy "Only allow authenticated users to insert" on "public"."reminders";

drop policy "Enable users to view their own data only" on "public"."reminders";

alter table "public"."chat_messages" drop constraint "chat_messages_role_check";

alter table "public"."message_feedback" drop constraint "message_feedback_feedback_type_check";

create table "public"."user_update_views" (
    "id" uuid not null default uuid_generate_v4(),
    "profile" uuid,
    "contract" bigint,
    "platform" text not null,
    "last_viewed_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_update_views" enable row level security;

alter table "public"."reminders" alter column "profile" set default auth.uid();

CREATE UNIQUE INDEX user_update_views_pkey ON public.user_update_views USING btree (id);

CREATE UNIQUE INDEX user_update_views_profile_contract_platform_key ON public.user_update_views USING btree (profile, contract, platform);

alter table "public"."user_update_views" add constraint "user_update_views_pkey" PRIMARY KEY using index "user_update_views_pkey";

alter table "public"."user_update_views" add constraint "user_update_views_contract_fkey" FOREIGN KEY (contract) REFERENCES contracts(id) ON DELETE CASCADE not valid;

alter table "public"."user_update_views" validate constraint "user_update_views_contract_fkey";

alter table "public"."user_update_views" add constraint "user_update_views_platform_check" CHECK ((platform = ANY (ARRAY['employee'::text, 'admin'::text]))) not valid;

alter table "public"."user_update_views" validate constraint "user_update_views_platform_check";

alter table "public"."user_update_views" add constraint "user_update_views_profile_contract_platform_key" UNIQUE using index "user_update_views_profile_contract_platform_key";

alter table "public"."user_update_views" add constraint "user_update_views_profile_fkey" FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_update_views" validate constraint "user_update_views_profile_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."user_update_views" to "anon";

grant insert on table "public"."user_update_views" to "anon";

grant references on table "public"."user_update_views" to "anon";

grant select on table "public"."user_update_views" to "anon";

grant trigger on table "public"."user_update_views" to "anon";

grant truncate on table "public"."user_update_views" to "anon";

grant update on table "public"."user_update_views" to "anon";

grant delete on table "public"."user_update_views" to "authenticated";

grant insert on table "public"."user_update_views" to "authenticated";

grant references on table "public"."user_update_views" to "authenticated";

grant select on table "public"."user_update_views" to "authenticated";

grant trigger on table "public"."user_update_views" to "authenticated";

grant truncate on table "public"."user_update_views" to "authenticated";

grant update on table "public"."user_update_views" to "authenticated";

grant delete on table "public"."user_update_views" to "service_role";

grant insert on table "public"."user_update_views" to "service_role";

grant references on table "public"."user_update_views" to "service_role";

grant select on table "public"."user_update_views" to "service_role";

grant trigger on table "public"."user_update_views" to "service_role";

grant truncate on table "public"."user_update_views" to "service_role";

grant update on table "public"."user_update_views" to "service_role";

create policy "Enable insert for users based on user_id"
on "public"."reminders"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = profile));


create policy "Users can insert their own update views"
on "public"."user_update_views"
as permissive
for insert
to public
with check ((auth.uid() = profile));


create policy "Users can update their own update views"
on "public"."user_update_views"
as permissive
for update
to public
using ((auth.uid() = profile));


create policy "Users can view their own update views"
on "public"."user_update_views"
as permissive
for select
to public
using ((auth.uid() = profile));


create policy "Enable users to view their own data only"
on "public"."reminders"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = profile));


CREATE TRIGGER update_user_update_views_updated_at BEFORE UPDATE ON public.user_update_views FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


