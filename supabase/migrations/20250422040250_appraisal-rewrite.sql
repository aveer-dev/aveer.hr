create type "public"."appraisal_status" as enum ('draft', 'submitted', 'manager_reviewed');
create type "public"."question_group" as enum ('growth_and_development', 'company_values', 'competencies', 'private_manager_assessment');
create type "public"."question_type" as enum ('textarea', 'yesno', 'scale', 'multiselect');
create sequence "public"."question_templates_id_seq";
create sequence "public"."template_questions_id_seq";
drop policy "Enable all for authenticated users only" on "public"."appraisal_answers";
drop policy "Enable all for authenticated users only" on "public"."appraisal_history";
drop policy "Enable read for all users" on "public"."platform_thirdparty_keys";
revoke delete on table "public"."appraisal_history" from "anon";
revoke insert on table "public"."appraisal_history" from "anon";
revoke references on table "public"."appraisal_history" from "anon";
revoke select on table "public"."appraisal_history" from "anon";
revoke trigger on table "public"."appraisal_history" from "anon";
revoke truncate on table "public"."appraisal_history" from "anon";
revoke update on table "public"."appraisal_history" from "anon";
revoke delete on table "public"."appraisal_history" from "authenticated";
revoke insert on table "public"."appraisal_history" from "authenticated";
revoke references on table "public"."appraisal_history" from "authenticated";
revoke select on table "public"."appraisal_history" from "authenticated";
revoke trigger on table "public"."appraisal_history" from "authenticated";
revoke truncate on table "public"."appraisal_history" from "authenticated";
revoke update on table "public"."appraisal_history" from "authenticated";
revoke delete on table "public"."appraisal_history" from "service_role";
revoke insert on table "public"."appraisal_history" from "service_role";
revoke references on table "public"."appraisal_history" from "service_role";
revoke select on table "public"."appraisal_history" from "service_role";
revoke trigger on table "public"."appraisal_history" from "service_role";
revoke truncate on table "public"."appraisal_history" from "service_role";
revoke update on table "public"."appraisal_history" from "service_role";
revoke delete on table "public"."platform_thirdparty_keys" from "anon";
revoke insert on table "public"."platform_thirdparty_keys" from "anon";
revoke references on table "public"."platform_thirdparty_keys" from "anon";
revoke select on table "public"."platform_thirdparty_keys" from "anon";
revoke trigger on table "public"."platform_thirdparty_keys" from "anon";
revoke truncate on table "public"."platform_thirdparty_keys" from "anon";
revoke update on table "public"."platform_thirdparty_keys" from "anon";
revoke delete on table "public"."platform_thirdparty_keys" from "authenticated";
revoke insert on table "public"."platform_thirdparty_keys" from "authenticated";
revoke references on table "public"."platform_thirdparty_keys" from "authenticated";
revoke select on table "public"."platform_thirdparty_keys" from "authenticated";
revoke trigger on table "public"."platform_thirdparty_keys" from "authenticated";
revoke truncate on table "public"."platform_thirdparty_keys" from "authenticated";
revoke update on table "public"."platform_thirdparty_keys" from "authenticated";
revoke delete on table "public"."platform_thirdparty_keys" from "service_role";
revoke insert on table "public"."platform_thirdparty_keys" from "service_role";
revoke references on table "public"."platform_thirdparty_keys" from "service_role";
revoke select on table "public"."platform_thirdparty_keys" from "service_role";
revoke trigger on table "public"."platform_thirdparty_keys" from "service_role";
revoke truncate on table "public"."platform_thirdparty_keys" from "service_role";
revoke update on table "public"."platform_thirdparty_keys" from "service_role";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_appraisal_fkey";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_contract_fkey";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_contract_score_check";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_entity_fkey";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_manager_contract_fkey";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_org_profile_fkey";
alter table "public"."appraisal_history" drop constraint "appraisal_history_entity_fkey";
alter table "public"."appraisal_history" drop constraint "appraisal_history_org_fkey";
alter table "public"."appraisal_answers" drop constraint "appraisal_answers_org_fkey";
alter table "public"."appraisal_history" drop constraint "appraisal_history_pkey";
alter table "public"."platform_thirdparty_keys" drop constraint "platform_thirdparty_keys_pkey";
drop index if exists "public"."appraisal_history_pkey";
drop index if exists "public"."platform_thirdparty_keys_pkey";
drop table "public"."appraisal_history";
drop table "public"."platform_thirdparty_keys";
alter type "public"."third_party_auth_platforms" rename to "third_party_auth_platforms__old_version_to_be_dropped";
create type "public"."third_party_auth_platforms" as enum ('google', 'deel');
create table "public"."appraisal_cycles" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "org" text not null,
    "entity" bigint,
    "start_date" date not null default now(),
    "end_date" date not null,
    "manager_review_due_date" date not null,
    "question_template" bigint not null,
    "self_review_due_date" date not null,
    "name" text not null,
    "description" text,
    "created_by" uuid not null default auth.uid()
);
alter table "public"."appraisal_cycles" enable row level security;
create table "public"."question_templates" (
    "id" bigint not null default nextval('question_templates_id_seq'::regclass),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "description" text,
    "is_draft" boolean not null default true,
    "org" text not null,
    "created_by" uuid not null default auth.uid()
);
alter table "public"."question_templates" enable row level security;
alter table "public"."question_templates" add column "custom_group_names" jsonb[];
create table "public"."template_questions" (
    "id" bigint not null default nextval('template_questions_id_seq'::regclass),
    "template_id" bigint not null,
    "question" text not null,
    "manager_question" text,
    "type" question_type not null,
    "options" text[],
    "required" boolean default false,
    "order_index" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "org" text not null,
    "group" question_group not null default 'growth_and_development'::question_group,
    "team_ids" integer[]
);
alter table "public"."template_questions" enable row level security;
create table "public"."thirdparty_keys" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "token" text not null,
    "refresh_token" text not null,
    "platform" third_party_auth_platforms not null,
    "org" text not null,
    "added_by" uuid not null default auth.uid()
);
alter table "public"."thirdparty_keys" enable row level security;
alter table "public"."contract_calendar_config" alter column platform type "public"."third_party_auth_platforms" using platform::text::"public"."third_party_auth_platforms";
alter table "public"."profiles_roles" alter column role type "public"."app_role" using role::text::"public"."app_role";
alter table "public"."roles" alter column name type "public"."app_role" using name::text::"public"."app_role";
alter table "public"."third_party_tokens" alter column platform type "public"."third_party_auth_platforms" using platform::text::"public"."third_party_auth_platforms";
drop type "public"."third_party_auth_platforms__old_version_to_be_dropped";
alter table "public"."appraisal_answers" drop column "appraisal";
alter table "public"."appraisal_answers" drop column "contract";
alter table "public"."appraisal_answers" drop column "contract_note";
alter table "public"."appraisal_answers" drop column "contract_score";
alter table "public"."appraisal_answers" drop column "entity";
alter table "public"."appraisal_answers" drop column "group";
alter table "public"."appraisal_answers" drop column "manager_contract";
alter table "public"."appraisal_answers" drop column "manager_note";
alter table "public"."appraisal_answers" drop column "manager_score";
alter table "public"."appraisal_answers" drop column "org_note";
alter table "public"."appraisal_answers" drop column "org_profile";
alter table "public"."appraisal_answers" drop column "org_score";
alter table "public"."appraisal_answers" drop column "org_submission_date";
alter table "public"."appraisal_answers" drop column "submission_date";
alter table "public"."appraisal_answers" add column "appraisal_cycle_id" bigint;
alter table "public"."appraisal_answers" add column "contract_id" bigint;
alter table "public"."appraisal_answers" add column "employee_submission_date" timestamp with time zone;
alter table "public"."appraisal_answers" add column "manager_contract_id" bigint;
alter table "public"."appraisal_answers" add column "status" appraisal_status default 'draft'::appraisal_status;
alter table "public"."appraisal_answers" add column "updated_at" timestamp with time zone default timezone('utc'::text, now());
alter table "public"."appraisal_answers" add column "answers_new" jsonb;
update "public"."appraisal_answers"
set "answers_new" = (
    select jsonb_agg(elem)
    from unnest("answers") as elem
);
alter table "public"."appraisal_answers" drop column "answers";
alter table "public"."appraisal_answers" rename column "answers_new" to "answers";
alter table "public"."appraisal_answers" alter column "answers" set default '[]'::jsonb;
alter table "public"."appraisal_answers" alter column "created_at" set default timezone('utc'::text, now());
alter table "public"."appraisal_answers" alter column "created_at" drop not null;
alter table "public"."appraisal_answers" alter column "id" set generated always;
alter table "public"."appraisal_answers" alter column "manager_answers" set default '{}'::jsonb[];
alter table "public"."appraisal_answers" alter column "manager_answers" set not null;
alter table "public"."legal_entities" add column "entity_subtype" text;
alter table "public"."legal_entities" add column "thirdparty_id" text;
alter sequence "public"."question_templates_id_seq" owned by "public"."question_templates"."id";
alter sequence "public"."template_questions_id_seq" owned by "public"."template_questions"."id";
CREATE INDEX appraisal_answers_appraisal_cycle_id_idx ON public.appraisal_answers USING btree (appraisal_cycle_id);
CREATE INDEX appraisal_answers_contract_id_idx ON public.appraisal_answers USING btree (contract_id);
CREATE INDEX appraisal_answers_manager_contract_id_idx ON public.appraisal_answers USING btree (manager_contract_id);
CREATE INDEX appraisal_answers_org_idx ON public.appraisal_answers USING btree (org);
CREATE INDEX idx_template_questions_template_id ON public.template_questions USING btree (template_id);
CREATE UNIQUE INDEX legal_entities_thirdparty_id_key ON public.legal_entities USING btree (thirdparty_id);
CREATE UNIQUE INDEX question_templates_pkey ON public.question_templates USING btree (id);
CREATE UNIQUE INDEX template_questions_pkey ON public.template_questions USING btree (id);
CREATE UNIQUE INDEX appraisal_history_pkey ON public.appraisal_cycles USING btree (id);
CREATE UNIQUE INDEX platform_thirdparty_keys_pkey ON public.thirdparty_keys USING btree (id);
alter table "public"."appraisal_cycles" add constraint "appraisal_history_pkey" PRIMARY KEY using index "appraisal_history_pkey";
alter table "public"."question_templates" add constraint "question_templates_pkey" PRIMARY KEY using index "question_templates_pkey";
alter table "public"."template_questions" add constraint "template_questions_pkey" PRIMARY KEY using index "template_questions_pkey";
alter table "public"."thirdparty_keys" add constraint "platform_thirdparty_keys_pkey" PRIMARY KEY using index "platform_thirdparty_keys_pkey";
alter table "public"."appraisal_answers" add constraint "appraisal_answers_appraisal_cycle_id_fkey" FOREIGN KEY (appraisal_cycle_id) REFERENCES appraisal_cycles(id) ON DELETE CASCADE not valid;
alter table "public"."appraisal_answers" validate constraint "appraisal_answers_appraisal_cycle_id_fkey";
alter table "public"."appraisal_answers" add constraint "appraisal_answers_contract_id_fkey" FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE not valid;
alter table "public"."appraisal_answers" validate constraint "appraisal_answers_contract_id_fkey";
alter table "public"."appraisal_cycles" add constraint "appraisal_cycles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."appraisal_cycles" validate constraint "appraisal_cycles_created_by_fkey";
alter table "public"."appraisal_cycles" add constraint "appraisal_cycles_question_template_fkey" FOREIGN KEY (question_template) REFERENCES question_templates(id) ON UPDATE CASCADE not valid;
alter table "public"."appraisal_cycles" validate constraint "appraisal_cycles_question_template_fkey";
alter table "public"."appraisal_cycles" add constraint "appraisal_history_entity_fkey" FOREIGN KEY (entity) REFERENCES legal_entities(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."appraisal_cycles" validate constraint "appraisal_history_entity_fkey";
alter table "public"."appraisal_cycles" add constraint "appraisal_history_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."appraisal_cycles" validate constraint "appraisal_history_org_fkey";
alter table "public"."legal_entities" add constraint "legal_entities_thirdparty_id_key" UNIQUE using index "legal_entities_thirdparty_id_key";
alter table "public"."question_templates" add constraint "question_templates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON UPDATE CASCADE not valid;
alter table "public"."question_templates" validate constraint "question_templates_created_by_fkey";
alter table "public"."question_templates" add constraint "question_templates_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."question_templates" validate constraint "question_templates_org_fkey";
alter table "public"."template_questions" add constraint "template_questions_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."template_questions" validate constraint "template_questions_org_fkey";
alter table "public"."template_questions" add constraint "template_questions_template_id_fkey" FOREIGN KEY (template_id) REFERENCES question_templates(id) ON DELETE CASCADE not valid;
alter table "public"."template_questions" validate constraint "template_questions_template_id_fkey";
alter table "public"."thirdparty_keys" add constraint "thirdparty_keys_added_by_fkey" FOREIGN KEY (added_by) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;
alter table "public"."thirdparty_keys" validate constraint "thirdparty_keys_added_by_fkey";
alter table "public"."thirdparty_keys" add constraint "thirdparty_keys_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."thirdparty_keys" validate constraint "thirdparty_keys_org_fkey";
alter table "public"."appraisal_answers" add constraint "appraisal_answers_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) ON DELETE CASCADE not valid;
alter table "public"."appraisal_answers" validate constraint "appraisal_answers_org_fkey";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;
grant delete on table "public"."appraisal_cycles" to "anon";
grant insert on table "public"."appraisal_cycles" to "anon";
grant references on table "public"."appraisal_cycles" to "anon";
grant select on table "public"."appraisal_cycles" to "anon";
grant trigger on table "public"."appraisal_cycles" to "anon";
grant truncate on table "public"."appraisal_cycles" to "anon";
grant update on table "public"."appraisal_cycles" to "anon";
grant delete on table "public"."appraisal_cycles" to "authenticated";
grant insert on table "public"."appraisal_cycles" to "authenticated";
grant references on table "public"."appraisal_cycles" to "authenticated";
grant select on table "public"."appraisal_cycles" to "authenticated";
grant trigger on table "public"."appraisal_cycles" to "authenticated";
grant truncate on table "public"."appraisal_cycles" to "authenticated";
grant update on table "public"."appraisal_cycles" to "authenticated";
grant delete on table "public"."appraisal_cycles" to "service_role";
grant insert on table "public"."appraisal_cycles" to "service_role";
grant references on table "public"."appraisal_cycles" to "service_role";
grant select on table "public"."appraisal_cycles" to "service_role";
grant trigger on table "public"."appraisal_cycles" to "service_role";
grant truncate on table "public"."appraisal_cycles" to "service_role";
grant update on table "public"."appraisal_cycles" to "service_role";
grant delete on table "public"."question_templates" to "anon";
grant insert on table "public"."question_templates" to "anon";
grant references on table "public"."question_templates" to "anon";
grant select on table "public"."question_templates" to "anon";
grant trigger on table "public"."question_templates" to "anon";
grant truncate on table "public"."question_templates" to "anon";
grant update on table "public"."question_templates" to "anon";
grant delete on table "public"."question_templates" to "authenticated";
grant insert on table "public"."question_templates" to "authenticated";
grant references on table "public"."question_templates" to "authenticated";
grant select on table "public"."question_templates" to "authenticated";
grant trigger on table "public"."question_templates" to "authenticated";
grant truncate on table "public"."question_templates" to "authenticated";
grant update on table "public"."question_templates" to "authenticated";
grant delete on table "public"."question_templates" to "service_role";
grant insert on table "public"."question_templates" to "service_role";
grant references on table "public"."question_templates" to "service_role";
grant select on table "public"."question_templates" to "service_role";
grant trigger on table "public"."question_templates" to "service_role";
grant truncate on table "public"."question_templates" to "service_role";
grant update on table "public"."question_templates" to "service_role";
grant delete on table "public"."template_questions" to "anon";
grant insert on table "public"."template_questions" to "anon";
grant references on table "public"."template_questions" to "anon";
grant select on table "public"."template_questions" to "anon";
grant trigger on table "public"."template_questions" to "anon";
grant truncate on table "public"."template_questions" to "anon";
grant update on table "public"."template_questions" to "anon";
grant delete on table "public"."template_questions" to "authenticated";
grant insert on table "public"."template_questions" to "authenticated";
grant references on table "public"."template_questions" to "authenticated";
grant select on table "public"."template_questions" to "authenticated";
grant trigger on table "public"."template_questions" to "authenticated";
grant truncate on table "public"."template_questions" to "authenticated";
grant update on table "public"."template_questions" to "authenticated";
grant delete on table "public"."template_questions" to "service_role";
grant insert on table "public"."template_questions" to "service_role";
grant references on table "public"."template_questions" to "service_role";
grant select on table "public"."template_questions" to "service_role";
grant trigger on table "public"."template_questions" to "service_role";
grant truncate on table "public"."template_questions" to "service_role";
grant update on table "public"."template_questions" to "service_role";
grant delete on table "public"."thirdparty_keys" to "anon";
grant insert on table "public"."thirdparty_keys" to "anon";
grant references on table "public"."thirdparty_keys" to "anon";
grant select on table "public"."thirdparty_keys" to "anon";
grant trigger on table "public"."thirdparty_keys" to "anon";
grant truncate on table "public"."thirdparty_keys" to "anon";
grant update on table "public"."thirdparty_keys" to "anon";
grant delete on table "public"."thirdparty_keys" to "authenticated";
grant insert on table "public"."thirdparty_keys" to "authenticated";
grant references on table "public"."thirdparty_keys" to "authenticated";
grant select on table "public"."thirdparty_keys" to "authenticated";
grant trigger on table "public"."thirdparty_keys" to "authenticated";
grant truncate on table "public"."thirdparty_keys" to "authenticated";
grant update on table "public"."thirdparty_keys" to "authenticated";
grant delete on table "public"."thirdparty_keys" to "service_role";
grant insert on table "public"."thirdparty_keys" to "service_role";
grant references on table "public"."thirdparty_keys" to "service_role";
grant select on table "public"."thirdparty_keys" to "service_role";
grant trigger on table "public"."thirdparty_keys" to "service_role";
grant truncate on table "public"."thirdparty_keys" to "service_role";
grant update on table "public"."thirdparty_keys" to "service_role";
create policy "Allow managers to create appraisal answer"
on "public"."appraisal_answers"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM managers
  WHERE ((managers.profile = auth.uid()) AND (managers.org = appraisal_answers.org)))));
create policy "Employees can insert their own appraisal answers"
on "public"."appraisal_answers"
as permissive
for insert
to public
with check ((auth.uid() IN ( SELECT contracts.profile
   FROM contracts
  WHERE (contracts.id = appraisal_answers.contract_id))));
create policy "Employees can update their own appraisal answers"
on "public"."appraisal_answers"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT contracts.profile
   FROM contracts
  WHERE (contracts.id = appraisal_answers.contract_id))));
create policy "Employees can view their own appraisal answers"
on "public"."appraisal_answers"
as permissive
for select
to public
using ((auth.uid() IN ( SELECT contracts.profile
   FROM contracts
  WHERE (contracts.id = appraisal_answers.contract_id))));
create policy "Managers and admins can view org employees' appraisal answers"
on "public"."appraisal_answers"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM profiles_roles
  WHERE ((profiles_roles.profile = auth.uid()) AND (profiles_roles.organisation = appraisal_answers.org)))) OR (EXISTS ( SELECT 1
   FROM managers
  WHERE ((managers.profile = auth.uid()) AND (managers.org = appraisal_answers.org))))));
create policy "Managers can update their direct reports' appraisal answers"
on "public"."appraisal_answers"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT contracts.profile
   FROM contracts
  WHERE (contracts.id = appraisal_answers.manager_contract_id))));
create policy "Enable all for authenticated users only"
on "public"."appraisal_cycles"
as permissive
for all
to authenticated
using (true);
create policy "Enable delete for authenticated users"
on "public"."question_templates"
as permissive
for delete
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable insert for authenticated users"
on "public"."question_templates"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));
create policy "Enable read access for authenticated users"
on "public"."question_templates"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable update for authenticated users"
on "public"."question_templates"
as permissive
for update
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable delete for authenticated users"
on "public"."template_questions"
as permissive
for delete
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable insert for authenticated users"
on "public"."template_questions"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));
create policy "Enable read access for authenticated users"
on "public"."template_questions"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable update for authenticated users"
on "public"."template_questions"
as permissive
for update
to public
using ((auth.role() = 'authenticated'::text));
create policy "Enable access for all users"
on "public"."thirdparty_keys"
as permissive
for all
to public
using (true);
create policy "Enable read for all users"
on "public"."thirdparty_keys"
as permissive
for select
to authenticated
using (true);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appraisal_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_templates_updated_at BEFORE UPDATE ON public.question_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_template_questions_updated_at BEFORE UPDATE ON public.template_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
