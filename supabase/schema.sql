

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
    'time_off'
);


ALTER TYPE "public"."policy_types" OWNER TO "postgres";


CREATE TYPE "public"."role_status" AS ENUM (
    'open',
    'close'
);


ALTER TYPE "public"."role_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."role_status" IS 'Is role open or closed';



CREATE TYPE "public"."work_locations" AS ENUM (
    'on-site',
    'remote',
    'hybrid'
);


ALTER TYPE "public"."work_locations" OWNER TO "postgres";


COMMENT ON TYPE "public"."work_locations" IS 'Where will people work from?';



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
    LANGUAGE "plpgsql"
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


CREATE TABLE IF NOT EXISTS "public"."approval_policies" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "type" "public"."policy_types" NOT NULL,
    "levels" "jsonb"[] NOT NULL,
    "org" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
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
    "start_date" "date",
    "end_date" "date",
    "probation_period" numeric,
    "paid_leave" integer DEFAULT 20,
    "sick_leave" integer DEFAULT 20,
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
    "gender" "text"
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



COMMENT ON COLUMN "public"."contracts"."gender" IS 'male or female';



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
    "can_legal_entity" boolean DEFAULT false NOT NULL
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
    "state_location" "text" NOT NULL,
    "work_authorization" boolean NOT NULL,
    "require_sponsorship" boolean NOT NULL,
    "race_ethnicity" "text" NOT NULL,
    "veterian_status" "text",
    "gender" "text",
    "disability" "text",
    "links" "jsonb",
    "role" bigint NOT NULL,
    "org" "text" NOT NULL,
    "documents" "jsonb"[] DEFAULT '{}'::"jsonb"[] NOT NULL,
    "stage" "text" DEFAULT 'applicant'::"text" NOT NULL,
    "custom_answers" "jsonb"[] DEFAULT '{}'::"jsonb"[]
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
    "level_name" "text"
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
    "paid_time_off" numeric DEFAULT '20'::numeric,
    "sick_leave" numeric DEFAULT '20'::numeric,
    "probation" numeric DEFAULT '90'::numeric,
    "additional_offerings" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "org" "text" NOT NULL,
    "work_schedule" "text",
    "work_shedule_interval" "text",
    "about_us" "text",
    "maternity_leave" smallint DEFAULT '60'::smallint,
    "paternity_leave" smallint DEFAULT '20'::smallint
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
    "org" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."nationality" IS 'User''s country';



COMMENT ON COLUMN "public"."profiles"."email" IS 'User''s personal email address';



CREATE TABLE IF NOT EXISTS "public"."profiles_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" NOT NULL,
    "profile" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "organisation" "text"
);


ALTER TABLE "public"."profiles_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles_roles" IS 'Profile and their roles';



COMMENT ON COLUMN "public"."profiles_roles"."profile" IS 'Link user profile';



COMMENT ON COLUMN "public"."profiles_roles"."organisation" IS 'organisation';



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text"
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



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "managers" "jsonb"[] NOT NULL,
    "org" "text"
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
    "hand_over" "uuid",
    "hand_over_note" "text",
    "note" "text",
    "levels" "jsonb"[] DEFAULT '{}'::"jsonb"[]
);


ALTER TABLE "public"."time_off" OWNER TO "postgres";


COMMENT ON COLUMN "public"."time_off"."org" IS 'The org the time off belongs to';



COMMENT ON COLUMN "public"."time_off"."hand_over" IS 'Hand over person for leave';



COMMENT ON COLUMN "public"."time_off"."hand_over_note" IS 'Note for handover person';



COMMENT ON COLUMN "public"."time_off"."note" IS 'Leave note, for approver';



COMMENT ON COLUMN "public"."time_off"."levels" IS 'Copied from related org policy';



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



ALTER TABLE ONLY "public"."approval_policies"
    ADD CONSTRAINT "approval_policies_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_entities"
    ADD CONSTRAINT "legal entities_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "job_applications_delete_trigger" AFTER DELETE ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applicants_on_delete"();



CREATE OR REPLACE TRIGGER "job_applications_insert_trigger" AFTER INSERT ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applicants_on_insert"();



CREATE OR REPLACE TRIGGER "update_contract_status_trigger" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_contract_status"();



ALTER TABLE ONLY "public"."approval_policies"
    ADD CONSTRAINT "approval_policies_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_level_fkey" FOREIGN KEY ("level") REFERENCES "public"."employee_levels"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."open_roles"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_signed_by_fkey" FOREIGN KEY ("signed_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_terminated_by_fkey" FOREIGN KEY ("terminated_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."dashboard_stats"
    ADD CONSTRAINT "dashboard_stats_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_levels"
    ADD CONSTRAINT "employee_levels_entity_fkey" FOREIGN KEY ("entity") REFERENCES "public"."legal_entities"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."employee_levels"
    ADD CONSTRAINT "employee_levels_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("country_code");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_contract_fkey" FOREIGN KEY ("contract") REFERENCES "public"."contracts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_hand_over_fkey" FOREIGN KEY ("hand_over") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_org_fkey" FOREIGN KEY ("org") REFERENCES "public"."organisations"("subdomain") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "time_off_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Enable all access for authenticated users only" ON "public"."profiles" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."contracts" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."dashboard_stats" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."employee_levels" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."legal_entities" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."org_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."organisations" TO "authenticated" USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."job_applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."legal_entities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."org_documents" TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organisations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles_roles" TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."time_off" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."job_applications" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."legal_entities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."open_roles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."states" FOR SELECT USING (true);



CREATE POLICY "Enable read access for auth users" ON "public"."approval_policies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for auth users" ON "public"."time_off" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for auth users" ON "public"."approval_policies" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for auth users" ON "public"."time_off" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."job_applications" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."approval_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboard_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legal_entities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."open_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "open_roles_policy" ON "public"."open_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles_roles"
  WHERE (("profiles_roles"."profile" = "auth"."uid"()) AND ("profiles_roles"."organisation" = "open_roles"."org")))));



ALTER TABLE "public"."org_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applicants_on_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applicants_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contract_status"() TO "service_role";


















GRANT ALL ON TABLE "public"."approval_policies" TO "anon";
GRANT ALL ON TABLE "public"."approval_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_policies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."approval_policies_id_seq" TO "service_role";



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
