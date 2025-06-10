create sequence "public"."chat_messages_id_seq";

create sequence "public"."chat_tool_usage_id_seq";

create sequence "public"."chats_id_seq";

create sequence "public"."message_feedback_id_seq";

create table "public"."chat_messages" (
    "id" integer not null default nextval('chat_messages_id_seq'::regclass),
    "chat_id" integer not null,
    "role" character varying(20) not null,
    "content" text not null,
    "model" character varying(100),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "metadata" jsonb default '{}'::jsonb,
    "is_deleted" boolean default false,
    "parent_message_id" integer,
    "search_vector" tsvector generated always as (to_tsvector('english'::regconfig, content)) stored
);


alter table "public"."chat_messages" enable row level security;

create table "public"."chat_tool_usage" (
    "id" integer not null default nextval('chat_tool_usage_id_seq'::regclass),
    "message_id" integer not null,
    "tool_name" character varying(255) not null,
    "tool_input" jsonb,
    "tool_output" jsonb,
    "execution_time_ms" integer,
    "created_at" timestamp with time zone default now()
);


alter table "public"."chat_tool_usage" enable row level security;

create table "public"."chats" (
    "id" integer not null default nextval('chats_id_seq'::regclass),
    "profile_id" uuid not null,
    "contract_id" integer,
    "org" character varying(255) not null,
    "title" character varying(255),
    "model" character varying(100) default 'gemini-1.5-flash'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_message_at" timestamp with time zone default now(),
    "is_archived" boolean default false,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."chats" enable row level security;

create table "public"."message_feedback" (
    "id" integer not null default nextval('message_feedback_id_seq'::regclass),
    "message_id" integer not null,
    "profile_id" uuid not null,
    "feedback_type" character varying(20) not null,
    "comment" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."message_feedback" enable row level security;

alter table "public"."template_questions" add column "employee_ids" integer[] not null default '{}'::integer[];

alter sequence "public"."chat_messages_id_seq" owned by "public"."chat_messages"."id";

alter sequence "public"."chat_tool_usage_id_seq" owned by "public"."chat_tool_usage"."id";

alter sequence "public"."chats_id_seq" owned by "public"."chats"."id";

alter sequence "public"."message_feedback_id_seq" owned by "public"."message_feedback"."id";

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_tool_usage_pkey ON public.chat_tool_usage USING btree (id);

CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id);

CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);

CREATE INDEX idx_chat_messages_search ON public.chat_messages USING gin (search_vector);

CREATE INDEX idx_chats_last_message_at ON public.chats USING btree (last_message_at DESC);

CREATE INDEX idx_chats_org ON public.chats USING btree (org);

CREATE INDEX idx_chats_profile_id ON public.chats USING btree (profile_id);

CREATE INDEX idx_message_feedback_message_id ON public.message_feedback USING btree (message_id);

CREATE UNIQUE INDEX message_feedback_message_id_key ON public.message_feedback USING btree (message_id);

CREATE UNIQUE INDEX message_feedback_pkey ON public.message_feedback USING btree (id);

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_tool_usage" add constraint "chat_tool_usage_pkey" PRIMARY KEY using index "chat_tool_usage_pkey";

alter table "public"."chats" add constraint "chats_pkey" PRIMARY KEY using index "chats_pkey";

alter table "public"."message_feedback" add constraint "message_feedback_pkey" PRIMARY KEY using index "message_feedback_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_chat_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_parent_message_id_fkey" FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_parent_message_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_role_check";

alter table "public"."chat_tool_usage" add constraint "chat_tool_usage_message_id_fkey" FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE not valid;

alter table "public"."chat_tool_usage" validate constraint "chat_tool_usage_message_id_fkey";

alter table "public"."chats" add constraint "chats_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL not valid;

alter table "public"."chats" validate constraint "chats_contract_id_fkey";

alter table "public"."chats" add constraint "chats_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_org_fkey";

alter table "public"."chats" add constraint "chats_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_profile_id_fkey";

alter table "public"."message_feedback" add constraint "message_feedback_feedback_type_check" CHECK (((feedback_type)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying, 'comment'::character varying])::text[]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_feedback_type_check";

alter table "public"."message_feedback" add constraint "message_feedback_message_id_fkey" FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_message_id_fkey";

alter table "public"."message_feedback" add constraint "message_feedback_message_id_key" UNIQUE using index "message_feedback_message_id_key";

alter table "public"."message_feedback" add constraint "message_feedback_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_profile_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_chat_last_message_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.chats
    SET last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."chat_tool_usage" to "anon";

grant insert on table "public"."chat_tool_usage" to "anon";

grant references on table "public"."chat_tool_usage" to "anon";

grant select on table "public"."chat_tool_usage" to "anon";

grant trigger on table "public"."chat_tool_usage" to "anon";

grant truncate on table "public"."chat_tool_usage" to "anon";

grant update on table "public"."chat_tool_usage" to "anon";

grant delete on table "public"."chat_tool_usage" to "authenticated";

grant insert on table "public"."chat_tool_usage" to "authenticated";

grant references on table "public"."chat_tool_usage" to "authenticated";

grant select on table "public"."chat_tool_usage" to "authenticated";

grant trigger on table "public"."chat_tool_usage" to "authenticated";

grant truncate on table "public"."chat_tool_usage" to "authenticated";

grant update on table "public"."chat_tool_usage" to "authenticated";

grant delete on table "public"."chat_tool_usage" to "service_role";

grant insert on table "public"."chat_tool_usage" to "service_role";

grant references on table "public"."chat_tool_usage" to "service_role";

grant select on table "public"."chat_tool_usage" to "service_role";

grant trigger on table "public"."chat_tool_usage" to "service_role";

grant truncate on table "public"."chat_tool_usage" to "service_role";

grant update on table "public"."chat_tool_usage" to "service_role";

grant delete on table "public"."chats" to "anon";

grant insert on table "public"."chats" to "anon";

grant references on table "public"."chats" to "anon";

grant select on table "public"."chats" to "anon";

grant trigger on table "public"."chats" to "anon";

grant truncate on table "public"."chats" to "anon";

grant update on table "public"."chats" to "anon";

grant delete on table "public"."chats" to "authenticated";

grant insert on table "public"."chats" to "authenticated";

grant references on table "public"."chats" to "authenticated";

grant select on table "public"."chats" to "authenticated";

grant trigger on table "public"."chats" to "authenticated";

grant truncate on table "public"."chats" to "authenticated";

grant update on table "public"."chats" to "authenticated";

grant delete on table "public"."chats" to "service_role";

grant insert on table "public"."chats" to "service_role";

grant references on table "public"."chats" to "service_role";

grant select on table "public"."chats" to "service_role";

grant trigger on table "public"."chats" to "service_role";

grant truncate on table "public"."chats" to "service_role";

grant update on table "public"."chats" to "service_role";

grant delete on table "public"."message_feedback" to "anon";

grant insert on table "public"."message_feedback" to "anon";

grant references on table "public"."message_feedback" to "anon";

grant select on table "public"."message_feedback" to "anon";

grant trigger on table "public"."message_feedback" to "anon";

grant truncate on table "public"."message_feedback" to "anon";

grant update on table "public"."message_feedback" to "anon";

grant delete on table "public"."message_feedback" to "authenticated";

grant insert on table "public"."message_feedback" to "authenticated";

grant references on table "public"."message_feedback" to "authenticated";

grant select on table "public"."message_feedback" to "authenticated";

grant trigger on table "public"."message_feedback" to "authenticated";

grant truncate on table "public"."message_feedback" to "authenticated";

grant update on table "public"."message_feedback" to "authenticated";

grant delete on table "public"."message_feedback" to "service_role";

grant insert on table "public"."message_feedback" to "service_role";

grant references on table "public"."message_feedback" to "service_role";

grant select on table "public"."message_feedback" to "service_role";

grant trigger on table "public"."message_feedback" to "service_role";

grant truncate on table "public"."message_feedback" to "service_role";

grant update on table "public"."message_feedback" to "service_role";

create policy "Users can create messages in their chats"
on "public"."chat_messages"
as permissive
for insert
to public
with check ((chat_id IN ( SELECT chats.id
   FROM chats
  WHERE (chats.profile_id = auth.uid()))));


create policy "Users can update their own messages"
on "public"."chat_messages"
as permissive
for update
to public
using ((chat_id IN ( SELECT chats.id
   FROM chats
  WHERE (chats.profile_id = auth.uid()))));


create policy "Users can view messages from their chats"
on "public"."chat_messages"
as permissive
for select
to public
using ((chat_id IN ( SELECT chats.id
   FROM chats
  WHERE (chats.profile_id = auth.uid()))));


create policy "Users can view tool usage in their chats"
on "public"."chat_tool_usage"
as permissive
for select
to public
using ((message_id IN ( SELECT m.id
   FROM (chat_messages m
     JOIN chats c ON ((m.chat_id = c.id)))
  WHERE (c.profile_id = auth.uid()))));


create policy "Users can create their own chats"
on "public"."chats"
as permissive
for insert
to public
with check ((profile_id = auth.uid()));


create policy "Users can delete their own chats"
on "public"."chats"
as permissive
for delete
to public
using ((profile_id = auth.uid()));


create policy "Users can update their own chats"
on "public"."chats"
as permissive
for update
to public
using ((profile_id = auth.uid()));


create policy "Users can view their own chats"
on "public"."chats"
as permissive
for select
to public
using ((profile_id = auth.uid()));


create policy "Users can create feedback"
on "public"."message_feedback"
as permissive
for insert
to public
with check ((profile_id = auth.uid()));


create policy "Users can edit feedback on messages in their chats"
on "public"."message_feedback"
as permissive
for update
to authenticated
using ((message_id IN ( SELECT m.id
   FROM (chat_messages m
     JOIN chats c ON ((m.chat_id = c.id)))
  WHERE (c.profile_id = auth.uid()))));


create policy "Users can view feedback on messages in their chats"
on "public"."message_feedback"
as permissive
for select
to public
using ((message_id IN ( SELECT m.id
   FROM (chat_messages m
     JOIN chats c ON ((m.chat_id = c.id)))
  WHERE (c.profile_id = auth.uid()))));


CREATE TRIGGER update_chat_last_message_after_insert AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_chat_last_message_at();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


