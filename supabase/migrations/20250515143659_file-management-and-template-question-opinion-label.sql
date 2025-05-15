create type "public"."access_level" as enum ('read', 'write', 'delete', 'full', 'owner');

create type "public"."file_ownership_type" as enum ('employee', 'organisation');

create type "public"."file_type" as enum ('document', 'storage');

create sequence "public"."files_id_seq";

create sequence "public"."folders_id_seq";

create sequence "public"."resource_access_id_seq";

create table "public"."files" (
    "id" integer not null default nextval('files_id_seq'::regclass),
    "name" text not null,
    "folder" integer,
    "file_type" file_type not null,
    "document" integer,
    "storage_url" text,
    "org" text not null,
    "entity" integer,
    "owner_type" file_ownership_type not null,
    "owner_id" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "created_by" uuid not null default auth.uid()
);


create table "public"."folders" (
    "id" integer not null default nextval('folders_id_seq'::regclass),
    "name" text not null,
    "parent" integer,
    "org" text not null,
    "entity" integer,
    "owner_type" file_ownership_type not null,
    "owner_id" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "created_by" uuid not null default auth.uid()
);


create table "public"."resource_access" (
    "id" integer not null default nextval('resource_access_id_seq'::regclass),
    "folder" integer,
    "file" integer,
    "profile" uuid,
    "access_level" access_level not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "team" bigint
);



alter table "public"."template_questions" add column "scale_labels" jsonb;

alter sequence "public"."files_id_seq" owned by "public"."files"."id";

alter sequence "public"."folders_id_seq" owned by "public"."folders"."id";

alter sequence "public"."resource_access_id_seq" owned by "public"."resource_access"."id";

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);

CREATE UNIQUE INDEX folders_pkey ON public.folders USING btree (id);

CREATE INDEX idx_files_document ON public.files USING btree (document);

CREATE INDEX idx_files_entity ON public.files USING btree (entity);

CREATE INDEX idx_files_folder ON public.files USING btree (folder);

CREATE INDEX idx_files_org ON public.files USING btree (org);

CREATE INDEX idx_files_owner ON public.files USING btree (owner_type, owner_id);

CREATE INDEX idx_folders_entity ON public.folders USING btree (entity);

CREATE INDEX idx_folders_org ON public.folders USING btree (org);

CREATE INDEX idx_folders_owner ON public.folders USING btree (owner_type, owner_id);

CREATE INDEX idx_folders_parent ON public.folders USING btree (parent);

CREATE INDEX idx_resource_access_file ON public.resource_access USING btree (file);

CREATE INDEX idx_resource_access_folder ON public.resource_access USING btree (folder);

CREATE INDEX idx_resource_access_profile ON public.resource_access USING btree (profile);

CREATE UNIQUE INDEX resource_access_file_profile_key ON public.resource_access USING btree (file, profile);

CREATE UNIQUE INDEX resource_access_folder_profile_key ON public.resource_access USING btree (folder, profile);

CREATE UNIQUE INDEX resource_access_pkey ON public.resource_access USING btree (id);

alter table "public"."files" add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

alter table "public"."folders" add constraint "folders_pkey" PRIMARY KEY using index "folders_pkey";

alter table "public"."resource_access" add constraint "resource_access_pkey" PRIMARY KEY using index "resource_access_pkey";

alter table "public"."files" add constraint "files_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."files" validate constraint "files_created_by_fkey";

alter table "public"."files" add constraint "files_document_fkey" FOREIGN KEY (document) REFERENCES documents(id) not valid;

alter table "public"."files" validate constraint "files_document_fkey";

alter table "public"."files" add constraint "files_entity_fkey" FOREIGN KEY (entity) REFERENCES legal_entities(id) not valid;

alter table "public"."files" validate constraint "files_entity_fkey";

alter table "public"."files" add constraint "files_folder_fkey" FOREIGN KEY (folder) REFERENCES folders(id) not valid;

alter table "public"."files" validate constraint "files_folder_fkey";

alter table "public"."files" add constraint "files_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) not valid;

alter table "public"."files" validate constraint "files_org_fkey";

alter table "public"."folders" add constraint "folders_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."folders" validate constraint "folders_created_by_fkey";

alter table "public"."folders" add constraint "folders_entity_fkey" FOREIGN KEY (entity) REFERENCES legal_entities(id) not valid;

alter table "public"."folders" validate constraint "folders_entity_fkey";

alter table "public"."folders" add constraint "folders_org_fkey" FOREIGN KEY (org) REFERENCES organisations(subdomain) not valid;

alter table "public"."folders" validate constraint "folders_org_fkey";

alter table "public"."folders" add constraint "folders_parent_fkey" FOREIGN KEY (parent) REFERENCES folders(id) not valid;

alter table "public"."folders" validate constraint "folders_parent_fkey";

alter table "public"."resource_access" add constraint "resource_access_check" CHECK ((((folder IS NOT NULL) AND (file IS NULL)) OR ((folder IS NULL) AND (file IS NOT NULL)))) not valid;

alter table "public"."resource_access" validate constraint "resource_access_check";

alter table "public"."resource_access" add constraint "resource_access_file_fkey" FOREIGN KEY (file) REFERENCES files(id) not valid;

alter table "public"."resource_access" validate constraint "resource_access_file_fkey";

alter table "public"."resource_access" add constraint "resource_access_file_profile_key" UNIQUE using index "resource_access_file_profile_key";

alter table "public"."resource_access" add constraint "resource_access_folder_fkey" FOREIGN KEY (folder) REFERENCES folders(id) not valid;

alter table "public"."resource_access" validate constraint "resource_access_folder_fkey";

alter table "public"."resource_access" add constraint "resource_access_folder_profile_key" UNIQUE using index "resource_access_folder_profile_key";

alter table "public"."resource_access" add constraint "resource_access_profile_fkey" FOREIGN KEY (profile) REFERENCES profiles(id) not valid;

alter table "public"."resource_access" validate constraint "resource_access_profile_fkey";

alter table "public"."resource_access" add constraint "resource_access_team_fkey" FOREIGN KEY (team) REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."resource_access" validate constraint "resource_access_team_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.authorize_role(org_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles_roles
    WHERE
      profiles_roles.profile = auth.uid()
      AND profiles_roles.organisation = org_name
      AND profiles_roles.role = 'admin'
      AND profiles_roles.disable = false
  );
$function$
;

CREATE OR REPLACE FUNCTION public.create_org_settings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insert default settings for the new organization
    INSERT INTO public.org_settings (org) VALUES (NEW.subdomain);

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant references on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant trigger on table "public"."files" to "anon";

grant truncate on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant references on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant trigger on table "public"."files" to "authenticated";

grant truncate on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant references on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant trigger on table "public"."files" to "service_role";

grant truncate on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."folders" to "anon";

grant insert on table "public"."folders" to "anon";

grant references on table "public"."folders" to "anon";

grant select on table "public"."folders" to "anon";

grant trigger on table "public"."folders" to "anon";

grant truncate on table "public"."folders" to "anon";

grant update on table "public"."folders" to "anon";

grant delete on table "public"."folders" to "authenticated";

grant insert on table "public"."folders" to "authenticated";

grant references on table "public"."folders" to "authenticated";

grant select on table "public"."folders" to "authenticated";

grant trigger on table "public"."folders" to "authenticated";

grant truncate on table "public"."folders" to "authenticated";

grant update on table "public"."folders" to "authenticated";

grant delete on table "public"."folders" to "service_role";

grant insert on table "public"."folders" to "service_role";

grant references on table "public"."folders" to "service_role";

grant select on table "public"."folders" to "service_role";

grant trigger on table "public"."folders" to "service_role";

grant truncate on table "public"."folders" to "service_role";

grant update on table "public"."folders" to "service_role";

grant delete on table "public"."resource_access" to "anon";

grant insert on table "public"."resource_access" to "anon";

grant references on table "public"."resource_access" to "anon";

grant select on table "public"."resource_access" to "anon";

grant trigger on table "public"."resource_access" to "anon";

grant truncate on table "public"."resource_access" to "anon";

grant update on table "public"."resource_access" to "anon";

grant delete on table "public"."resource_access" to "authenticated";

grant insert on table "public"."resource_access" to "authenticated";

grant references on table "public"."resource_access" to "authenticated";

grant select on table "public"."resource_access" to "authenticated";

grant trigger on table "public"."resource_access" to "authenticated";

grant truncate on table "public"."resource_access" to "authenticated";

grant update on table "public"."resource_access" to "authenticated";

grant delete on table "public"."resource_access" to "service_role";

grant insert on table "public"."resource_access" to "service_role";

grant references on table "public"."resource_access" to "service_role";

grant select on table "public"."resource_access" to "service_role";

grant trigger on table "public"."resource_access" to "service_role";

grant truncate on table "public"."resource_access" to "service_role";

grant update on table "public"."resource_access" to "service_role";

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_access_updated_at BEFORE UPDATE ON public.resource_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


