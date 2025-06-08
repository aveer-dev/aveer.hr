

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."boarding_state" AS ENUM (
    'initial',
    'pending',
    'approved'
);


ALTER TYPE "public"."boarding_state" OWNER TO "postgres";


CREATE TYPE "public"."boarding_type" AS ENUM (
    'on',
    'off'
);


ALTER TYPE "public"."boarding_type" OWNER TO "postgres";


CREATE TYPE "public"."contract_state" AS ENUM (
    'awaiting signatures',
    'awaiting org signature',
    'awaiting signature',
    'signed',
    'inactive',
    'terminated',
    'scheduled termination'
);


ALTER TYPE "public"."contract_state" OWNER TO "postgres";


COMMENT ON TYPE "public"."contract_state" IS 'State options of contracts';



CREATE TYPE "public"."contract_type" AS ENUM (
    'employee',
    'contractor'
);


ALTER TYPE "public"."contract_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."contract_type" IS 'Employee or contractor';



CREATE TYPE "public"."employment_type" AS ENUM (
    'full-time',
    'part-time',
    'contract'
);


ALTER TYPE "public"."employment_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."employment_type" IS 'Full-time or part-time options';



CREATE TYPE "public"."is_open" AS ENUM (
    'open',
    'closed',
    'partial'
);


ALTER TYPE "public"."is_open" OWNER TO "postgres";


COMMENT ON TYPE "public"."is_open" IS 'Is contract open, closed, partial';



CREATE TYPE "public"."leave_status_enum" AS ENUM (
    'pending',
    'denied',
    'approved',
    'more',
    'cancelled'
);


ALTER TYPE "public"."leave_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."leave_type_enum" AS ENUM (
    'paid',
    'sick',
    'maternity',
    'paternity',
    'unpaid'
);


ALTER TYPE "public"."leave_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."policy_types" AS ENUM (
    'time_off',
    'role_application',
    'boarding'
);


ALTER TYPE "public"."policy_types" OWNER TO "postgres";


CREATE TYPE "public"."role_status" AS ENUM (
    'open',
    'close'
);


ALTER TYPE "public"."role_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."role_status" IS 'Is role open or closed';



CREATE TYPE "public"."user_type" AS ENUM (
    'admin',
    'employee'
);


ALTER TYPE "public"."user_type" OWNER TO "postgres";


CREATE TYPE "public"."work_locations" AS ENUM (
    'on-site',
    'remote',
    'hybrid'
);


ALTER TYPE "public"."work_locations" OWNER TO "postgres";


COMMENT ON TYPE "public"."work_locations" IS 'Where will people work from?';



CREATE OR REPLACE FUNCTION "public"."authorize_role"("org_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$DECLARE
  bind_role int;
  user_role public.app_role;
  user_role_org text;
BEGIN
  -- Fetch user role once and store it to reduce number of calls
  SELECT (auth.jwt() ->> 'user_role')::public.app_role INTO user_role;
  SELECT (auth.jwt() ->> 'user_role_org')::text INTO user_role_org;

  -- Check if user_role_org is null or does not match org_name
  IF user_role_org IS NULL OR LOWER(user_role_org) != LOWER(org_name) THEN
    RETURN false;
  ELSE
    SELECT COUNT(*)
    INTO bind_role
    FROM public.profiles_roles
    WHERE profiles_roles.organisation = user_role_org
      AND profiles_roles.role = user_role
      AND profiles_roles.profile = auth.uid();

    RETURN bind_role > 0;
  END IF;
END;$$;


ALTER FUNCTION "public"."authorize_role"("org_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$declare
    claims jsonb;
    user_role public.app_role;
    user_role_org text;
  begin

    -- Fetch the user role in the profiles_roles table
    select role, organisation into user_role, user_role_org from public.profiles_roles where profile = (event->>'user_id')::uuid;

    claims := event->'claims';

    -- Set the user role claim
    claims := JSONB_SET(
      claims,
      '{user_role}',
      COALESCE(TO_JSONB(user_role), 'null'::jsonb)
    );

    -- Set the user role organization claim
    claims := JSONB_SET(
      claims,
      '{user_role_org}',
      COALESCE(TO_JSONB(user_role_org), 'null'::jsonb)
    );

    -- Update the 'claims' object in the original event
    event := JSONB_SET(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_inbox_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
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
END;$$;


ALTER FUNCTION "public"."notify_inbox_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_time_off_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    INSERT INTO public.notifications (created_at, body, "for", org, title, sender_profile, sender_contract, link)
    VALUES (now(),
            'One of your employees has just request for a time off. Open notification to review leave request details. From "'||TO_CHAR(NEW."from",
'Day, DD Month YYYY')||'" to "'||TO_CHAR(NEW."to",
'Day, DD Month YYYY')||'"',
            'admin',
            NEW.org,
            'New Leave Request',
            NEW.profile,
            New.contract,
            '/time-off');
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."notify_time_off_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_time_off_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    INSERT INTO public.notifications (created_at, body, "for", org, title, contracts, link)
    VALUES (now(),
            'The status of your leave request has been updated to ' || NEW.status,
            'employee',
            NEW.org,
            'Leave request update',
            array[NEW.contract],
            '/' || NEW.org || '/' || NEW.contract || '/leave');
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."notify_time_off_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reminder_insert_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    INSERT INTO public.notifications (body, "for", org, title, sender_profile, sender_contract, link, schedule_at)
    VALUES ('This is to notify you about your remainder. Requested a reminder about ' || NEW.title,
            'employee',
            NEW.org,
            'Reminder | ' || NEW.title,
            NEW.profile,
            NEW.contract,
            '/',
            NEW.datetime);
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."reminder_insert_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_applicants_on_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE open_roles
    SET applicants = applicants - 1
    WHERE id = OLD.role;
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."update_applicants_on_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_applicants_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE open_roles
    SET applicants = applicants + 1
    WHERE id = NEW.role;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_applicants_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_contract_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.org_signed IS DISTINCT FROM OLD.org_signed OR NEW.profile_signed IS DISTINCT FROM OLD.profile_signed THEN
        IF NEW.org_signed IS NOT NULL AND NEW.profile_signed IS NULL THEN
            NEW.status = 'awaiting signature';
        ELSIF NEW.org_signed IS NOT NULL AND NEW.profile_signed IS NOT NULL THEN
            NEW.status = 'signed';
        ELSIF NEW.profile_signed IS NOT NULL AND NEW.org_signed IS NULL THEN
            NEW.status = 'awaiting org signature';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contract_status"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appraisal_answers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "answers" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "contract" bigint NOT NULL,
    "group" "text" NOT NULL,
    "org" "text",
    "entity" bigint,
    "appraisal" bigint NOT NULL,
    "contract_note" "text",
    "contract_score" smallint DEFAULT '0'::smallint NOT NULL,
    "manager_answers" "jsonb"[],
    "manager_contract" bigint,
    "manager_note" "text",
    "manager_score" smallint DEFAULT '0'::smallint,
    "manager_submission_date" timestamp with time zone,
    "org_note" "text",
    "org_profile" "uuid",
    "org_score" smallint DEFAULT '0'::smallint,
    "org_submission_date" timestamp with time zone,
    "submission_date" "date",
    CONSTRAINT "appraisal_answers_contract_score_check" CHECK (("contract_score" < 100))
);


ALTER TABLE "public"."appraisal_answers" OWNER TO "postgres";


ALTER TABLE "public"."appraisal_answers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appraisal_answers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."appraisal_history" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "group" "text" NOT NULL,
    "start_date" "date" DEFAULT "now"() NOT NULL,
    "end_date" "date" NOT NULL
);


ALTER TABLE "public"."appraisal_history" OWNER TO "postgres";


ALTER TABLE "public"."appraisal_history" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appraisal_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."appraisal_questions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "group" "text" NOT NULL,
    "updateded_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "questions" "jsonb"[] NOT NULL
);


ALTER TABLE "public"."appraisal_questions" OWNER TO "postgres";


ALTER TABLE "public"."appraisal_questions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appraisal_questions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."appraisal_settings" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "frequency" "text" NOT NULL,
    "start_date" "date",
    "org" "text" NOT NULL,
    "entity" bigint,
    "timeline" smallint DEFAULT '2'::smallint NOT NULL
);


ALTER TABLE "public"."appraisal_settings" OWNER TO "postgres";


ALTER TABLE "public"."appraisal_settings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appraisal_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."approval_policies" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "type" "public"."policy_types" NOT NULL,
    "levels" "jsonb"[] NOT NULL,
    "org" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "is_default" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."approval_policies" OWNER TO "postgres";


COMMENT ON TABLE "public"."approval_policies" IS 'All approval policies, like time-off approval policy';



COMMENT ON COLUMN "public"."approval_policies"."updated_at" IS 'Last update date';



ALTER TABLE "public"."approval_policies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."approval_policies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."boarding_check_lists" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "checklist" "jsonb"[] NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "is_default" boolean NOT NULL,
    "type" "public"."boarding_type" NOT NULL,
    "policy" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."boarding_check_lists" OWNER TO "postgres";


ALTER TABLE "public"."boarding_check_lists" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."boarding_check_lists_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."boaring_check_list_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."boaring_check_list_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contract_check_list" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "contract" bigint NOT NULL,
    "boarding" bigint NOT NULL,
    "checklist" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "org" "text" NOT NULL,
    "state" "public"."boarding_state" DEFAULT 'initial'::"public"."boarding_state" NOT NULL,
    "levels" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL
);


ALTER TABLE "public"."contract_check_list" OWNER TO "postgres";


ALTER TABLE "public"."contract_check_list" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contract_check_list_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_title" "text" NOT NULL,
    "level" bigint,
    "employment_type" "public"."employment_type" NOT NULL,
    "work_schedule" "text",
    "work_shedule_interval" "text",
    "responsibilities" "jsonb",
    "salary" numeric DEFAULT '0'::numeric NOT NULL,
    "signing_bonus" numeric,
    "fixed_allowance" "jsonb",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "probation_period" numeric DEFAULT '0'::numeric,
    "paid_leave" integer DEFAULT 0,
    "sick_leave" integer DEFAULT 0,
    "profile" "uuid",
    "entity" bigint NOT NULL,
    "org_signed" timestamp with time zone,
    "profile_signed" timestamp with time zone,
    "status" "public"."contract_state" DEFAULT 'awaiting signatures'::"public"."contract_state" NOT NULL,
    "signed_by" "uuid",
    "profile_signature_string" "text",
    "org_signature_string" "text",
    "terminated_by" "uuid",
    "org" "text" NOT NULL,
    "additional_offerings" "jsonb"[],
    "work_location" "public"."work_locations",
    "role" bigint,
    "sick_leave_used" smallint DEFAULT '0'::smallint NOT NULL,
    "paid_leave_used" smallint DEFAULT '0'::smallint NOT NULL,
    "paternity_leave_used" smallint DEFAULT '0'::smallint NOT NULL,
    "level_name" "text",
    "unpaid_leave_used" smallint DEFAULT '0'::smallint,
    "maternity_leave_used" smallint DEFAULT '0'::smallint,
    "maternity_leave" smallint DEFAULT '60'::smallint,
    "paternity_leave" smallint DEFAULT '20'::smallint,
    "team" bigint,
    "offboarding" bigint,
    "onboarding" bigint,
    "direct_report" bigint
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


COMMENT ON TABLE "public"."contracts" IS 'User contracts, they bind profiles (user) to legal entities';



COMMENT ON COLUMN "public"."contracts"."paid_leave" IS 'Normal number of leave days for employees';



COMMENT ON COLUMN "public"."contracts"."sick_leave" IS 'Number of sick leave days approved';



COMMENT ON COLUMN "public"."contracts"."profile" IS 'The owner of the contract';



COMMENT ON COLUMN "public"."contracts"."entity" IS 'Legal entity this contract belongs to';



COMMENT ON COLUMN "public"."contracts"."org_signed" IS 'Date, if organization has signed contract';



COMMENT ON COLUMN "public"."contracts"."profile_signed" IS 'Date, if profile user has signed';



COMMENT ON COLUMN "public"."contracts"."status" IS 'State of the contract';



COMMENT ON COLUMN "public"."contracts"."signed_by" IS 'The person that signed this document on-behalf of the legal entity';



COMMENT ON COLUMN "public"."contracts"."profile_signature_string" IS 'Signature string used to sign contract';



COMMENT ON COLUMN "public"."contracts"."org_signature_string" IS 'Signature string used by org rep';



COMMENT ON COLUMN "public"."contracts"."terminated_by" IS 'The profile that terminated contract.';



COMMENT ON COLUMN "public"."contracts"."org" IS 'org';



COMMENT ON COLUMN "public"."contracts"."role" IS 'Option to fetch details directly from roles, if connected';



COMMENT ON COLUMN "public"."contracts"."sick_leave_used" IS 'Number of sick leave days used';



COMMENT ON COLUMN "public"."contracts"."paid_leave_used" IS 'Number of paid leave used';



COMMENT ON COLUMN "public"."contracts"."paternity_leave_used" IS 'Number of paternity leave days used';



COMMENT ON COLUMN "public"."contracts"."level_name" IS 'Level, for manual input support';



ALTER TABLE "public"."contracts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contracts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "dial_code" "text" NOT NULL,
    "country_code" "text" NOT NULL,
    "can_legal_entity" boolean DEFAULT false NOT NULL,
    "currency_code" character varying(3),
    "currency_name" character varying(50)
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


COMMENT ON TABLE "public"."countries" IS 'List of all the countries in the world';



COMMENT ON COLUMN "public"."countries"."can_legal_entity" IS 'Is it possible for the company to be a legal entity?';



ALTER TABLE "public"."countries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."dashboard_stats" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "signed_contracts" numeric DEFAULT '0'::numeric,
    "contracts" numeric DEFAULT '0'::numeric NOT NULL,
    "org" "text" NOT NULL
);


ALTER TABLE "public"."dashboard_stats" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_stats" IS 'Auto-populated dashboard stats data';



COMMENT ON COLUMN "public"."dashboard_stats"."org" IS 'organisation';



ALTER TABLE "public"."dashboard_stats" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."dashboard_stats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."employee_levels" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "level" "text" NOT NULL,
    "role" "text",
    "min_salary" numeric NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "min_signing_bonus" numeric,
    "fixed_allowance" "jsonb"[],
    "max_salary" numeric DEFAULT '0'::numeric NOT NULL,
    "max_signing_bonus" numeric
);


ALTER TABLE "public"."employee_levels" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_levels" IS 'Think of it like salary bands. You get the gist now?';



COMMENT ON COLUMN "public"."employee_levels"."min_salary" IS 'Minimum salary of people in this level';



COMMENT ON COLUMN "public"."employee_levels"."max_salary" IS 'Maximum salary of people in this level';



ALTER TABLE "public"."employee_levels" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."employee_levels_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."inbox" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "org" "text" NOT NULL,
    "message" "text" NOT NULL,
    "draft" boolean DEFAULT true,
    "entity" bigint,
    "read" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "sender_profile" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "send_time" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."inbox" OWNER TO "postgres";


ALTER TABLE "public"."inbox" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."inbox_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone_number" "text",
    "resume_url" "text",
    "resume" "text",
    "cover_letter_url" "text",
    "cover_letter" "text",
    "country_location" "text",
    "state_location" "text",
    "work_authorization" boolean,
    "require_sponsorship" boolean,
    "race_ethnicity" "text",
    "veterian_status" "text",
    "gender" "text",
    "disability" "text",
    "links" "jsonb",
    "role" bigint NOT NULL,
    "org" "text" NOT NULL,
    "documents" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "stage" "text" DEFAULT 'applicant'::"text" NOT NULL,
    "custom_answers" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "levels" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL
);


ALTER TABLE "public"."job_applications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."job_applications"."documents" IS 'All documents used for applications';



ALTER TABLE "public"."job_applications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."job_applications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."legal_entities" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "formation_date" timestamp with time zone,
    "incorporation_country" "text" NOT NULL,
    "company_type" "text",
    "tax_no" "text",
    "sic" "text",
    "address_state" integer NOT NULL,
    "address_code" "text",
    "street_address" "text",
    "is_eor" boolean DEFAULT false NOT NULL,
    "org" "text" NOT NULL,
    "rn" "text"
);


ALTER TABLE "public"."legal_entities" OWNER TO "postgres";


COMMENT ON TABLE "public"."legal_entities" IS 'Legal details of every organization';



COMMENT ON COLUMN "public"."legal_entities"."formation_date" IS 'Date company was incorporated.';



COMMENT ON COLUMN "public"."legal_entities"."tax_no" IS 'Across different countries, they have different names for the number generated for every company, for tax purpose. Whatever the name it, I call it tax_no';



COMMENT ON COLUMN "public"."legal_entities"."sic" IS 'For industry classification of each company';



COMMENT ON COLUMN "public"."legal_entities"."address_state" IS 'Company''s physical address: state';



COMMENT ON COLUMN "public"."legal_entities"."address_code" IS 'Post code or zip code of entity physical address';



COMMENT ON COLUMN "public"."legal_entities"."street_address" IS 'Legal physical address street address';



COMMENT ON COLUMN "public"."legal_entities"."is_eor" IS 'Is the company an EOR company?';



COMMENT ON COLUMN "public"."legal_entities"."org" IS 'org';



COMMENT ON COLUMN "public"."legal_entities"."rn" IS 'Company registration number, for any kind of company';



ALTER TABLE "public"."legal_entities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."legal entities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."legal_entities" ALTER COLUMN "address_state" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."legal_entities_address_state_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."links" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link" character varying NOT NULL,
    "path" "text" NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."links" OWNER TO "postgres";


ALTER TABLE "public"."links" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."managers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "person" bigint,
    "role" bigint NOT NULL,
    "org" "text" NOT NULL,
    "team" bigint NOT NULL,
    "profile" "uuid"
);


ALTER TABLE "public"."managers" OWNER TO "postgres";


ALTER TABLE "public"."managers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."managers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "body" "text" DEFAULT ''::"text" NOT NULL,
    "contracts" bigint[],
    "org" "text" NOT NULL,
    "for" "public"."user_type" NOT NULL,
    "link" "text",
    "read" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "sender_contract" bigint,
    "sender_profile" "uuid",
    "title" "text" NOT NULL,
    "schedule_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."okr_objectives" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "okr" bigint NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "objective" "text" NOT NULL
);


ALTER TABLE "public"."okr_objectives" OWNER TO "postgres";


ALTER TABLE "public"."okr_objectives" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."okr_objectives_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."okr_results" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "okr" bigint NOT NULL,
    "okr_objective" bigint NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "result" "text" NOT NULL
);


ALTER TABLE "public"."okr_results" OWNER TO "postgres";


ALTER TABLE "public"."okr_results" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."okr_results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."okrs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "org" "text" NOT NULL,
    "entity" bigint,
    "start" timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."okrs" OWNER TO "postgres";


ALTER TABLE "public"."okrs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."okrs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."open_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_title" "text" NOT NULL,
    "level" bigint,
    "employment_type" "public"."employment_type" NOT NULL,
    "work_schedule" "text",
    "work_shedule_interval" "text",
    "responsibilities" "jsonb",
    "salary" numeric,
    "signing_bonus" numeric,
    "fixed_allowance" "jsonb",
    "probation_period" numeric,
    "paid_leave" integer DEFAULT 20,
    "sick_leave" integer DEFAULT 20,
    "entity" bigint NOT NULL,
    "org" "text" NOT NULL,
    "additional_offerings" "jsonb"[],
    "work_location" "public"."work_locations",
    "state" "public"."is_open" NOT NULL,
    "years_of_experience" numeric,
    "requirements" "jsonb"[],
    "applicants" numeric DEFAULT '0'::numeric NOT NULL,
    "custom_fields" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "level_name" "text",
    "is_manager" boolean DEFAULT false NOT NULL,
    "team" bigint,
    "policy" bigint,
    "direct_report" bigint,
    "enable_location" boolean DEFAULT true NOT NULL,
    "enable_voluntary_data" boolean DEFAULT true NOT NULL,
    "compensation_public" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."open_roles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."open_roles"."paid_leave" IS 'Normal number of leave days for employees';



COMMENT ON COLUMN "public"."open_roles"."sick_leave" IS 'Number of sick leave days approved';



COMMENT ON COLUMN "public"."open_roles"."entity" IS 'Legal entity this contract belongs to';



COMMENT ON COLUMN "public"."open_roles"."org" IS 'org';



COMMENT ON COLUMN "public"."open_roles"."state" IS 'Is contract an open role';



COMMENT ON COLUMN "public"."open_roles"."applicants" IS 'Updated by postgress function, counts and updates the number of applicants for this role';



COMMENT ON COLUMN "public"."open_roles"."level_name" IS 'Support for manual level system';



CREATE TABLE IF NOT EXISTS "public"."org_documents" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "link" "text",
    "signed_by" "uuid",
    "type" "text" NOT NULL,
    "profile" "uuid",
    "entity" bigint,
    "eor_entity" bigint,
    "signature_text" "text",
    "org" "text"
);


ALTER TABLE "public"."org_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."org_documents" IS 'All possible documents for an organisation';



COMMENT ON COLUMN "public"."org_documents"."signature_text" IS 'Text used as signature';



ALTER TABLE "public"."org_documents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."org_documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."org_settings" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sick_leave" numeric DEFAULT '20'::numeric,
    "probation" numeric DEFAULT '90'::numeric,
    "additional_offerings" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "org" "text" NOT NULL,
    "work_schedule" "text",
    "work_shedule_interval" "text",
    "about_us" "text",
    "maternity_leave" smallint DEFAULT '60'::smallint,
    "paternity_leave" smallint DEFAULT '20'::smallint,
    "salary_date" "date",
    "paid_leave" numeric DEFAULT '20'::numeric,
    "enable_task_manager" boolean DEFAULT false NOT NULL,
    "plane_key" "text",
    "plane_project" "text",
    "plane_workspace_slug" "text"
);


ALTER TABLE "public"."org_settings" OWNER TO "postgres";


ALTER TABLE "public"."org_settings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."org_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."organisations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "website" "text",
    "subdomain" "text" NOT NULL
);


ALTER TABLE "public"."organisations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organisations" IS 'All organisations';



COMMENT ON COLUMN "public"."organisations"."subdomain" IS 'Subdomain url prefix';



ALTER TABLE "public"."organisations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."organisations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."open_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profile_contract_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "nationality" "text",
    "email" "text" NOT NULL,
    "org" "text",
    "medical" "jsonb",
    "emergency_contact" "jsonb",
    "address" "jsonb",
    "mobile" "text",
    "gender" "text",
    "date_of_birth" timestamp without time zone,
    "fcm_token" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."nationality" IS 'User''s country';



COMMENT ON COLUMN "public"."profiles"."email" IS 'User''s personal email address';



COMMENT ON COLUMN "public"."profiles"."mobile" IS 'Mobile phone number';



CREATE TABLE IF NOT EXISTS "public"."profiles_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "profile" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "organisation" "text" NOT NULL,
    "disable" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles_roles" IS 'Profile and their roles';



COMMENT ON COLUMN "public"."profiles_roles"."profile" IS 'Link user profile';



COMMENT ON COLUMN "public"."profiles_roles"."organisation" IS 'organisation';



CREATE TABLE IF NOT EXISTS "public"."reminders" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "datetime" timestamp with time zone NOT NULL,
    "org" "text" NOT NULL,
    "contract" bigint NOT NULL,
    "type" "text",
    "profile" "uuid"
);


ALTER TABLE "public"."reminders" OWNER TO "postgres";


ALTER TABLE "public"."reminders" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reminders_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "name" "public"."app_role" DEFAULT 'admin'::"public"."app_role" NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."roles" IS 'Roles for users';



ALTER TABLE "public"."roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "short_code" character varying(10) NOT NULL,
    "country_code" character varying(2) NOT NULL
);


ALTER TABLE "public"."states" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."states_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."states_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."states_id_seq" OWNED BY "public"."states"."id";



CREATE TABLE IF NOT EXISTS "public"."team_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."team_roles" OWNER TO "postgres";


ALTER TABLE "public"."team_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."team_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "org" "text" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


COMMENT ON TABLE "public"."teams" IS 'teams, departments, groups, whatever UI or orgs choose to call it.';



ALTER TABLE "public"."teams" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."teams_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."time_off" (
    "id" bigint NOT NULL,
    "profile" "uuid" NOT NULL,
    "contract" bigint NOT NULL,
    "leave_type" "public"."leave_type_enum" NOT NULL,
    "from" timestamp with time zone NOT NULL,
    "to" timestamp with time zone NOT NULL,
    "status" "public"."leave_status_enum" NOT NULL,
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "org" "text" NOT NULL,
    "hand_over_note" "text",
    "note" "text",
    "levels" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "hand_over" bigint
);


ALTER TABLE "public"."time_off" OWNER TO "postgres";


COMMENT ON COLUMN "public"."time_off"."org" IS 'The org the time off belongs to';



COMMENT ON COLUMN "public"."time_off"."hand_over_note" IS 'Note for handover person';



COMMENT ON COLUMN "public"."time_off"."note" IS 'Leave note, for approver';



COMMENT ON COLUMN "public"."time_off"."levels" IS 'Copied from related org policy';



COMMENT ON COLUMN "public"."time_off"."hand_over" IS 'Who will take over during time off period';



ALTER TABLE "public"."time_off" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."time_off_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."profiles_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."states" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."states_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appraisal_history"
    ADD CONSTRAINT "appraisal_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appraisal_questions"
    ADD CONSTRAINT "appraisal_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appraisal_settings"
    ADD CONSTRAINT "appraisal_settings_org_key" UNIQUE ("org");



ALTER TABLE ONLY "public"."appraisal_settings"
    ADD CONSTRAINT "appraisal_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_policies"
    ADD CONSTRAINT "approval_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boarding_check_lists"
    ADD CONSTRAINT "boaring_check_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contract_check_list"
    ADD CONSTRAINT "contract_check_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_country_code_key" UNIQUE ("country_code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_stats"
    ADD CONSTRAINT "dashboard_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_levels"
    ADD CONSTRAINT "employee_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inbox"
    ADD CONSTRAINT "inbox_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_entities"
    ADD CONSTRAINT "legal entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_objectives"
    ADD CONSTRAINT "objectives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_results"
    ADD CONSTRAINT "okr_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okrs"
    ADD CONSTRAINT "okrs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_org_key" UNIQUE ("org");



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "profile_contract_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_nm_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_roles"
    ADD CONSTRAINT "team_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "email_notification" AFTER INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/email_notification', 'POST', '{"Content-type":"application/json"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "inbox_insert_trigger" AFTER INSERT ON "public"."inbox" FOR EACH ROW EXECUTE FUNCTION "public"."notify_inbox_insert"();



CREATE OR REPLACE TRIGGER "inbox_push_notification" AFTER INSERT ON "public"."inbox" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://byprsbkeackkgjsjlcgp.supabase.co/functions/v1/message_push', 'POST', '{"Content-type":"application/json"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "job_applications_delete_trigger" AFTER DELETE ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applicants_on_delete"();



CREATE OR REPLACE TRIGGER "job_applications_insert_trigger" AFTER INSERT ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applicants_on_insert"();



CREATE OR REPLACE TRIGGER "time_off_insert_trigger" AFTER INSERT ON "public"."time_off" FOR EACH ROW EXECUTE FUNCTION "public"."notify_time_off_insert"();



CREATE OR REPLACE TRIGGER "time_off_update_trigger" AFTER UPDATE ON "public"."time_off" FOR EACH ROW EXECUTE FUNCTION "public"."notify_time_off_update"();



CREATE OR REPLACE TRIGGER "update_contract_status_trigger" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_contract_status"();



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_appraisal_fkey" FOREIGN KEY ("appraisal") REFERENCES "public"."appraisal_history"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_contract_fkey" FOREIGN KEY ("contract") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_manager_contract_fkey" FOREIGN KEY ("manager_contract") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_answers"
    ADD CONSTRAINT "appraisal_answers_org_profile_fkey" FOREIGN KEY ("org_profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."appraisal_history"
    ADD CONSTRAINT "appraisal_history_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_history"
    ADD CONSTRAINT "appraisal_history_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_questions"
    ADD CONSTRAINT "appraisal_questions_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_questions"
    ADD CONSTRAINT "appraisal_questions_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_settings"
    ADD CONSTRAINT "appraisal_settings_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appraisal_settings"
    ADD CONSTRAINT "appraisal_settings_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_policies"
    ADD CONSTRAINT "approval_policies_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boarding_check_lists"
    ADD CONSTRAINT "boaring_check_list_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boarding_check_lists"
    ADD CONSTRAINT "boaring_check_list_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boarding_check_lists"
    ADD CONSTRAINT "boaring_check_list_policy_fkey" FOREIGN KEY ("policy") REFERENCES "public"."approval_policies"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."contract_check_list"
    ADD CONSTRAINT "contract_check_list_boarding_fkey" FOREIGN KEY ("boarding") REFERENCES "public"."boarding_check_lists"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."contract_check_list"
    ADD CONSTRAINT "contract_check_list_contract_fkey" FOREIGN KEY ("contract") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contract_check_list"
    ADD CONSTRAINT "contract_check_list_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_direct_report_fkey" FOREIGN KEY ("direct_report") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_level_fkey" FOREIGN KEY ("level") REFERENCES "public"."employee_levels"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_offboarding_fkey" FOREIGN KEY ("offboarding") REFERENCES "public"."boarding_check_lists"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_onboarding_fkey" FOREIGN KEY ("onboarding") REFERENCES "public"."boarding_check_lists"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."open_roles"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_terminated_by_fkey" FOREIGN KEY ("terminated_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."dashboard_stats"
    ADD CONSTRAINT "dashboard_stats_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_levels"
    ADD CONSTRAINT "employee_levels_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."employee_levels"
    ADD CONSTRAINT "employee_levels_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inbox"
    ADD CONSTRAINT "inbox_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inbox"
    ADD CONSTRAINT "inbox_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inbox"
    ADD CONSTRAINT "inbox_sender_profile_fkey" FOREIGN KEY ("sender_profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_country_location_fkey" FOREIGN KEY ("country_location") REFERENCES "public"."countries"("country_code") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."open_roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."legal_entities"
    ADD CONSTRAINT "legal_entities_address_state_fkey" FOREIGN KEY ("address_state") REFERENCES "public"."states"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."legal_entities"
    ADD CONSTRAINT "legal_entities_incorporation_country_fkey" FOREIGN KEY ("incorporation_country") REFERENCES "public"."countries"("country_code") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."legal_entities"
    ADD CONSTRAINT "legal_entities_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_person_fkey" FOREIGN KEY ("person") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_role_fkey1" FOREIGN KEY ("role") REFERENCES "public"."team_roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managers"
    ADD CONSTRAINT "managers_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_contract_fkey" FOREIGN KEY ("sender_contract") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_profile_fkey" FOREIGN KEY ("sender_profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_objectives"
    ADD CONSTRAINT "objectives_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_objectives"
    ADD CONSTRAINT "objectives_okr_fkey" FOREIGN KEY ("okr") REFERENCES "public"."okrs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_objectives"
    ADD CONSTRAINT "objectives_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_results"
    ADD CONSTRAINT "okr_results_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_results"
    ADD CONSTRAINT "okr_results_okr_fkey" FOREIGN KEY ("okr") REFERENCES "public"."okrs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_results"
    ADD CONSTRAINT "okr_results_okr_objective_fkey" FOREIGN KEY ("okr_objective") REFERENCES "public"."okr_objectives"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_results"
    ADD CONSTRAINT "okr_results_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okrs"
    ADD CONSTRAINT "okrs_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okrs"
    ADD CONSTRAINT "okrs_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "open_roles_direct_report_fkey" FOREIGN KEY ("direct_report") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "open_roles_policy_fkey" FOREIGN KEY ("policy") REFERENCES "public"."approval_policies"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "open_roles_team_fkey" FOREIGN KEY ("team") REFERENCES "public"."teams"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_eor_entity_fkey" FOREIGN KEY ("eor_entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."org_documents"
    ADD CONSTRAINT "org_documents_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "profile_contract_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "profile_contract_level_fkey" FOREIGN KEY ("level") REFERENCES "public"."employee_levels"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."open_roles"
    ADD CONSTRAINT "profile_contract_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_nationality_fkey" FOREIGN KEY ("nationality") REFERENCES "public"."countries"("country_code") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_organisation_fkey" FOREIGN KEY ("organisation") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "profiles_roles_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."roles"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_contract_fkey" FOREIGN KEY ("contract") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("country_code");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_contract_fkey" FOREIGN KEY ("contract") REFERENCES "public"."contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_hand_over_fkey" FOREIGN KEY ("hand_over") REFERENCES "public"."contracts"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Allow auth admin to read user roles" ON "public"."profiles_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "Allow employees to update read state" ON "public"."inbox" FOR UPDATE TO "authenticated" USING (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "inbox"."org")));



CREATE POLICY "Allow only authenticated org members to update" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "notifications"."org")));



CREATE POLICY "Enable all for auth users" ON "public"."boarding_check_lists" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."appraisal_answers" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."appraisal_history" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."appraisal_settings" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."contract_check_list" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."contracts" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."dashboard_stats" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."employee_levels" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."legal_entities" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."links" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."managers" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."okr_objectives" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."okr_results" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."org_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."organisations" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."teams" TO "authenticated" USING (true);



CREATE POLICY "Enable delete for auth and admin users" ON "public"."appraisal_questions" FOR DELETE TO "authenticated" USING ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "appraisal_questions"."org"))));



CREATE POLICY "Enable delete for authenticated users only" ON "public"."approval_policies" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."time_off" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."okrs" FOR DELETE USING ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "okrs"."org"))));



CREATE POLICY "Enable insert for all users" ON "public"."job_applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated admin users only" ON "public"."appraisal_questions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "appraisal_questions"."org"))));



CREATE POLICY "Enable insert for authenticated admin users only" ON "public"."okrs" FOR INSERT TO "authenticated" WITH CHECK (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "okrs"."org")));



CREATE POLICY "Enable insert for authenticated org admin users only" ON "public"."contracts" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize_role"("contracts"."org") AS "authorize_role"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."approval_policies" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."legal_entities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."org_documents" TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organisations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles_roles" TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."time_off" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for org's users only" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users auth org access" ON "public"."inbox" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."authorize_role"("inbox"."org") AS "authorize_role"));



CREATE POLICY "Enable read access for admin users" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all authenticated users" ON "public"."notifications" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."appraisal_questions" FOR SELECT TO "authenticated" USING (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "appraisal_questions"."org")));



CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."job_applications" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."legal_entities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."open_roles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."states" FOR SELECT USING (true);



CREATE POLICY "Enable read access for auth users" ON "public"."approval_policies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for auth users" ON "public"."time_off" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for auth users " ON "public"."inbox" FOR SELECT TO "authenticated" USING (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "inbox"."org")));



CREATE POLICY "Enable update for auth and admin users" ON "public"."appraisal_questions" FOR UPDATE TO "authenticated" USING ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "appraisal_questions"."org")))) WITH CHECK ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "appraisal_questions"."org"))));



CREATE POLICY "Enable update for auth users" ON "public"."approval_policies" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for auth users" ON "public"."time_off" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."job_applications" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable users to update their own data only" ON "public"."reminders" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "profile"));



CREATE POLICY "Enable users to view their own data only" ON "public"."okrs" FOR SELECT TO "authenticated" USING ((( SELECT ((("auth"."jwt"() ->> 'user_role'::"text"))::"public"."app_role" = 'admin'::"public"."app_role")) AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "okrs"."org"))));



CREATE POLICY "Enable users to view their own data only" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."reminders" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "profile") AND ( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "reminders"."org"))));



CREATE POLICY "Only admin in the org can update message" ON "public"."inbox" FOR UPDATE TO "authenticated" USING (( SELECT "public"."authorize_role"("inbox"."org") AS "authorize_role")) WITH CHECK (( SELECT (("auth"."jwt"() ->> 'user_role_org'::"text") = "inbox"."org")));



CREATE POLICY "Only allow admins  to delete inbox messages" ON "public"."inbox" FOR DELETE TO "authenticated" USING (( SELECT "public"."authorize_role"("inbox"."org") AS "authorize_role"));



CREATE POLICY "Only allow authenticated users to insert" ON "public"."reminders" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Only allow org admins to update" ON "public"."contracts" FOR UPDATE TO "authenticated" USING (( SELECT "public"."authorize_role"("contracts"."org") AS "authorize_role"));



CREATE POLICY "Only reminder owner can create a reminder" ON "public"."reminders" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "profile"));



CREATE POLICY "Policy with table joins" ON "public"."open_roles" FOR UPDATE TO "authenticated" USING (true);



ALTER TABLE "public"."appraisal_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appraisal_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appraisal_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appraisal_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."boarding_check_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contract_check_list" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboard_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inbox" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legal_entities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."managers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_objectives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okrs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."open_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "open_roles_policy" ON "public"."open_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_roles"
  WHERE (("profiles_roles"."profile" = "auth"."uid"()) AND ("profiles_roles"."organisation" = "open_roles"."org")))));



ALTER TABLE "public"."org_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_own_profile_policy" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";


























































































































































































GRANT ALL ON FUNCTION "public"."authorize_role"("org_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."authorize_role"("org_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize_role"("org_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_inbox_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_inbox_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_inbox_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_time_off_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_time_off_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_time_off_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_time_off_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_time_off_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_time_off_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reminder_insert_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."reminder_insert_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reminder_insert_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "service_role";


















GRANT ALL ON TABLE "public"."appraisal_answers" TO "anon";
GRANT ALL ON TABLE "public"."appraisal_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."appraisal_answers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_answers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_answers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_answers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."appraisal_history" TO "anon";
GRANT ALL ON TABLE "public"."appraisal_history" TO "authenticated";
GRANT ALL ON TABLE "public"."appraisal_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."appraisal_questions" TO "anon";
GRANT ALL ON TABLE "public"."appraisal_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."appraisal_questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."appraisal_settings" TO "anon";
GRANT ALL ON TABLE "public"."appraisal_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."appraisal_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."approval_policies" TO "anon";
GRANT ALL ON TABLE "public"."approval_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_policies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."boarding_check_lists" TO "anon";
GRANT ALL ON TABLE "public"."boarding_check_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."boarding_check_lists" TO "service_role";



GRANT ALL ON SEQUENCE "public"."boarding_check_lists_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."boarding_check_lists_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."boarding_check_lists_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."boaring_check_list_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."boaring_check_list_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."boaring_check_list_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contract_check_list" TO "anon";
GRANT ALL ON TABLE "public"."contract_check_list" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_check_list" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contract_check_list_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contract_check_list_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contract_check_list_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contracts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_stats" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dashboard_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dashboard_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dashboard_stats_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employee_levels" TO "anon";
GRANT ALL ON TABLE "public"."employee_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_levels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employee_levels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employee_levels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employee_levels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inbox" TO "anon";
GRANT ALL ON TABLE "public"."inbox" TO "authenticated";
GRANT ALL ON TABLE "public"."inbox" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inbox_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inbox_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inbox_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."job_applications" TO "anon";
GRANT ALL ON TABLE "public"."job_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."job_applications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."job_applications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."job_applications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."job_applications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."legal_entities" TO "anon";
GRANT ALL ON TABLE "public"."legal_entities" TO "authenticated";
GRANT ALL ON TABLE "public"."legal_entities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."legal entities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."legal entities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."legal entities_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."legal_entities_address_state_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."legal_entities_address_state_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."legal_entities_address_state_seq" TO "service_role";



GRANT ALL ON TABLE "public"."links" TO "anon";
GRANT ALL ON TABLE "public"."links" TO "authenticated";
GRANT ALL ON TABLE "public"."links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."links_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."managers" TO "anon";
GRANT ALL ON TABLE "public"."managers" TO "authenticated";
GRANT ALL ON TABLE "public"."managers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."managers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."managers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."managers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."okr_objectives" TO "anon";
GRANT ALL ON TABLE "public"."okr_objectives" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_objectives" TO "service_role";



GRANT ALL ON SEQUENCE "public"."okr_objectives_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."okr_objectives_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."okr_objectives_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."okr_results" TO "anon";
GRANT ALL ON TABLE "public"."okr_results" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."okr_results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."okr_results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."okr_results_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."okrs" TO "anon";
GRANT ALL ON TABLE "public"."okrs" TO "authenticated";
GRANT ALL ON TABLE "public"."okrs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."okrs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."okrs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."okrs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."open_roles" TO "anon";
GRANT ALL ON TABLE "public"."open_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."open_roles" TO "service_role";



GRANT ALL ON TABLE "public"."org_documents" TO "anon";
GRANT ALL ON TABLE "public"."org_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."org_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."org_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."org_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."org_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."org_settings" TO "anon";
GRANT ALL ON TABLE "public"."org_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."org_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."org_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."org_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."org_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organisations" TO "anon";
GRANT ALL ON TABLE "public"."organisations" TO "authenticated";
GRANT ALL ON TABLE "public"."organisations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."organisations_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_contract_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_contract_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_contract_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_roles" TO "anon";
GRANT ALL ON TABLE "public"."profiles_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_roles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles_roles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."reminders" TO "anon";
GRANT ALL ON TABLE "public"."reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."reminders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reminders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reminders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reminders_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";



GRANT ALL ON SEQUENCE "public"."states_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."states_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."states_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."team_roles" TO "anon";
GRANT ALL ON TABLE "public"."team_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."team_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."team_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."team_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."team_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."time_off" TO "anon";
GRANT ALL ON TABLE "public"."time_off" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off" TO "service_role";



GRANT ALL ON SEQUENCE "public"."time_off_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."time_off_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."time_off_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
