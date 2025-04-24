drop policy "Managers can update their direct reports' appraisal answers" on "public"."appraisal_answers";

alter table "public"."roles" alter column "name" drop default;

alter table "public"."template_questions" alter column "group" drop default;

alter type "public"."app_role" rename to "app_role__old_version_to_be_dropped";

create type "public"."app_role" as enum ('admin', 'roles_manager');

alter type "public"."question_group" rename to "question_group__old_version_to_be_dropped";

create type "public"."question_group" as enum ('growth_and_development', 'company_values', 'competencies', 'private_manager_assessment', 'goal_scoring', 'objectives');

alter table "public"."profiles_roles" alter column role type "public"."app_role" using role::text::"public"."app_role";

alter table "public"."roles" alter column name type "public"."app_role" using name::text::"public"."app_role";

alter table "public"."template_questions" alter column group type "public"."question_group" using group::text::"public"."question_group";

alter table "public"."roles" alter column "name" set default 'admin'::app_role;

alter table "public"."template_questions" alter column "group" set default 'growth_and_development'::question_group;

drop type "public"."app_role__old_version_to_be_dropped";

drop type "public"."question_group__old_version_to_be_dropped";

alter table "public"."appraisal_answers" add column "employee_goal_score" jsonb[];

alter table "public"."appraisal_answers" add column "goals" jsonb[];

alter table "public"."appraisal_answers" add column "manager_goal_score" jsonb[];

alter table "public"."appraisal_answers" add column "objectives" jsonb[];

alter table "public"."appraisal_answers" alter column "answers" set not null;

create policy "Managers can update their direct reports' appraisal answers"
on "public"."appraisal_answers"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM managers
  WHERE ((managers.profile = auth.uid()) AND (managers.org = appraisal_answers.org)))));



