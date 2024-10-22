alter table "public"."contracts" drop constraint "contracts_team_fkey";

alter table "public"."contracts" add constraint "contracts_team_fkey" FOREIGN KEY (team) REFERENCES teams(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."contracts" validate constraint "contracts_team_fkey";


