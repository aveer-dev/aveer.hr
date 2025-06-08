drop policy "Enable delete for auth and admin users" on "public"."appraisal_questions";
drop policy "Enable insert for authenticated admin users only" on "public"."appraisal_questions";
drop policy "Enable update for auth and admin users" on "public"."appraisal_questions";
drop policy "Enable delete for users based on user_id" on "public"."okrs";
drop policy "Enable users to view their own data only" on "public"."okrs";
alter table "public"."links" add column "document" bigint;
alter table "public"."template_questions" alter column "group" set data type question_group using "group"::text::question_group;
drop type "public"."question_group__old_version_to_be_dropped";
alter table "public"."links" add constraint "links_document_fkey" FOREIGN KEY (document) REFERENCES documents(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."links" validate constraint "links_document_fkey";
create policy "Enable delete for auth and admin users"
on "public"."appraisal_questions"
as permissive
for delete
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));
create policy "Enable insert for authenticated admin users only"
on "public"."appraisal_questions"
as permissive
for insert
to authenticated
with check ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));
create policy "Enable update for auth and admin users"
on "public"."appraisal_questions"
as permissive
for update
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))))
with check ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = appraisal_questions.org))));
create policy "Enable delete for users based on user_id"
on "public"."okrs"
as permissive
for delete
to public
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = okrs.org))));
create policy "Enable users to view their own data only"
on "public"."okrs"
as permissive
for select
to authenticated
using ((( SELECT (((auth.jwt() ->> 'user_role'::text))::app_role = 'admin'::app_role)) AND ( SELECT ((auth.jwt() ->> 'user_role_org'::text) = okrs.org))));
