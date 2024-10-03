alter table "public"."appraisal_answers" drop column "date";

alter table "public"."appraisal_answers" drop column "is_submitted";

alter table "public"."appraisal_answers" add column "appraisal" bigint not null;

alter table "public"."appraisal_answers" add column "contract_note" text;

alter table "public"."appraisal_answers" add column "contract_score" smallint not null default '0'::smallint;

alter table "public"."appraisal_answers" add column "manager_answers" jsonb[];

alter table "public"."appraisal_answers" add column "manager_contract" bigint;

alter table "public"."appraisal_answers" add column "manager_note" text;

alter table "public"."appraisal_answers" add column "manager_score" smallint default '0'::smallint;

alter table "public"."appraisal_answers" add column "manager_submission_date" timestamp with time zone;

alter table "public"."appraisal_answers" add column "org_note" text;

alter table "public"."appraisal_answers" add column "org_profile" uuid;

alter table "public"."appraisal_answers" add column "org_score" smallint default '0'::smallint;

alter table "public"."appraisal_answers" add column "org_submission_date" timestamp with time zone;

alter table "public"."appraisal_answers" add column "submission_date" date;

alter table "public"."appraisal_questions" add column "updateded_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text);

alter table "public"."appraisal_answers" add constraint "appraisal_answers_appraisal_fkey" FOREIGN KEY (appraisal) REFERENCES appraisal_history(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."appraisal_answers" validate constraint "appraisal_answers_appraisal_fkey";

alter table "public"."appraisal_answers" add constraint "appraisal_answers_contract_score_check" CHECK ((contract_score < 100)) not valid;

alter table "public"."appraisal_answers" validate constraint "appraisal_answers_contract_score_check";

alter table "public"."appraisal_answers" add constraint "appraisal_answers_manager_contract_fkey" FOREIGN KEY (manager_contract) REFERENCES contracts(id) ON UPDATE CASCADE not valid;

alter table "public"."appraisal_answers" validate constraint "appraisal_answers_manager_contract_fkey";

alter table "public"."appraisal_answers" add constraint "appraisal_answers_org_profile_fkey" FOREIGN KEY (org_profile) REFERENCES profiles(id) ON UPDATE CASCADE not valid;

alter table "public"."appraisal_answers" validate constraint "appraisal_answers_org_profile_fkey";


