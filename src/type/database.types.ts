export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appraisal_answers: {
        Row: {
          answers: Json[]
          appraisal: number
          contract: number
          contract_note: string | null
          contract_score: number
          created_at: string
          entity: number | null
          group: string
          id: number
          manager_answers: Json[] | null
          manager_contract: number | null
          manager_note: string | null
          manager_score: number | null
          manager_submission_date: string | null
          org: string | null
          org_note: string | null
          org_profile: string | null
          org_score: number | null
          org_submission_date: string | null
          submission_date: string | null
        }
        Insert: {
          answers?: Json[]
          appraisal: number
          contract: number
          contract_note?: string | null
          contract_score?: number
          created_at?: string
          entity?: number | null
          group: string
          id?: number
          manager_answers?: Json[] | null
          manager_contract?: number | null
          manager_note?: string | null
          manager_score?: number | null
          manager_submission_date?: string | null
          org?: string | null
          org_note?: string | null
          org_profile?: string | null
          org_score?: number | null
          org_submission_date?: string | null
          submission_date?: string | null
        }
        Update: {
          answers?: Json[]
          appraisal?: number
          contract?: number
          contract_note?: string | null
          contract_score?: number
          created_at?: string
          entity?: number | null
          group?: string
          id?: number
          manager_answers?: Json[] | null
          manager_contract?: number | null
          manager_note?: string | null
          manager_score?: number | null
          manager_submission_date?: string | null
          org?: string | null
          org_note?: string | null
          org_profile?: string | null
          org_score?: number | null
          org_submission_date?: string | null
          submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_answers_appraisal_fkey"
            columns: ["appraisal"]
            isOneToOne: false
            referencedRelation: "appraisal_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_answers_contract_fkey"
            columns: ["contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_answers_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_answers_manager_contract_fkey"
            columns: ["manager_contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_answers_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "appraisal_answers_org_profile_fkey"
            columns: ["org_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_history: {
        Row: {
          created_at: string
          end_date: string
          entity: number | null
          group: string
          id: number
          org: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          entity?: number | null
          group: string
          id?: number
          org: string
          start_date?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          entity?: number | null
          group?: string
          id?: number
          org?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_history_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_history_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      appraisal_questions: {
        Row: {
          created_at: string
          entity: number | null
          group: string
          id: number
          org: string
          questions: Json[]
          updateded_at: string | null
        }
        Insert: {
          created_at?: string
          entity?: number | null
          group: string
          id?: number
          org: string
          questions: Json[]
          updateded_at?: string | null
        }
        Update: {
          created_at?: string
          entity?: number | null
          group?: string
          id?: number
          org?: string
          questions?: Json[]
          updateded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_questions_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_questions_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      appraisal_settings: {
        Row: {
          created_at: string
          entity: number | null
          frequency: string
          id: number
          org: string
          start_date: string | null
          timeline: number
        }
        Insert: {
          created_at?: string
          entity?: number | null
          frequency: string
          id?: number
          org: string
          start_date?: string | null
          timeline?: number
        }
        Update: {
          created_at?: string
          entity?: number | null
          frequency?: string
          id?: number
          org?: string
          start_date?: string | null
          timeline?: number
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_settings_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_settings_org_fkey"
            columns: ["org"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      approval_policies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_default: boolean
          levels: Json[]
          name: string
          org: string
          type: Database["public"]["Enums"]["policy_types"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_default?: boolean
          levels: Json[]
          name?: string
          org: string
          type: Database["public"]["Enums"]["policy_types"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_default?: boolean
          levels?: Json[]
          name?: string
          org?: string
          type?: Database["public"]["Enums"]["policy_types"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_policies_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      boarding_check_lists: {
        Row: {
          checklist: Json[]
          created_at: string
          description: string | null
          entity: number | null
          id: number
          is_default: boolean
          name: string
          org: string
          policy: number
          type: Database["public"]["Enums"]["boarding_type"]
        }
        Insert: {
          checklist: Json[]
          created_at?: string
          description?: string | null
          entity?: number | null
          id?: number
          is_default: boolean
          name: string
          org: string
          policy: number
          type: Database["public"]["Enums"]["boarding_type"]
        }
        Update: {
          checklist?: Json[]
          created_at?: string
          description?: string | null
          entity?: number | null
          id?: number
          is_default?: boolean
          name?: string
          org?: string
          policy?: number
          type?: Database["public"]["Enums"]["boarding_type"]
        }
        Relationships: [
          {
            foreignKeyName: "boaring_check_list_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boaring_check_list_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "boaring_check_list_policy_fkey"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "approval_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      calendars: {
        Row: {
          calendar_id: string
          created_at: string
          entity: number | null
          id: number
          org: string
          platform: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          entity?: number | null
          id?: number
          org: string
          platform: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          entity?: number | null
          id?: number
          org?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendars_entity_fkey"
            columns: ["entity"]
            isOneToOne: true
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendars_org_fkey"
            columns: ["org"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      contract_calendar_config: {
        Row: {
          calendar_id: string
          contract: number | null
          created_at: string
          id: number
          org: string
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id: string
          profile: string | null
        }
        Insert: {
          calendar_id: string
          contract?: number | null
          created_at?: string
          id?: number
          org: string
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id: string
          profile?: string | null
        }
        Update: {
          calendar_id?: string
          contract?: number | null
          created_at?: string
          id?: number
          org?: string
          platform?: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id?: string
          profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_calendar_config_contract_fkey"
            columns: ["contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_calendar_config_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "contract_calendar_config_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_check_list: {
        Row: {
          boarding: number
          checklist: Json[]
          contract: number
          created_at: string
          id: number
          levels: Json[]
          org: string
          state: Database["public"]["Enums"]["boarding_state"]
        }
        Insert: {
          boarding: number
          checklist?: Json[]
          contract: number
          created_at?: string
          id?: number
          levels?: Json[]
          org: string
          state?: Database["public"]["Enums"]["boarding_state"]
        }
        Update: {
          boarding?: number
          checklist?: Json[]
          contract?: number
          created_at?: string
          id?: number
          levels?: Json[]
          org?: string
          state?: Database["public"]["Enums"]["boarding_state"]
        }
        Relationships: [
          {
            foreignKeyName: "contract_check_list_boarding_fkey"
            columns: ["boarding"]
            isOneToOne: false
            referencedRelation: "boarding_check_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_check_list_contract_fkey"
            columns: ["contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_check_list_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      contracts: {
        Row: {
          additional_offerings: Json[] | null
          created_at: string
          direct_report: number | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date: string | null
          entity: number
          fixed_allowance: Json | null
          id: number
          job_title: string
          level: number | null
          level_name: string | null
          maternity_leave: number | null
          maternity_leave_used: number | null
          offboarding: number | null
          onboarding: number | null
          org: string
          org_signature_string: string | null
          org_signed: string | null
          paid_leave: number | null
          paid_leave_used: number
          paternity_leave: number | null
          paternity_leave_used: number
          probation_period: number | null
          profile: string | null
          profile_signature_string: string | null
          profile_signed: string | null
          responsibilities: Json | null
          role: number | null
          salary: number
          sick_leave: number | null
          sick_leave_used: number
          signed_by: string | null
          signing_bonus: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_state"]
          team: number | null
          terminated_by: string | null
          unpaid_leave_used: number | null
          work_location: Database["public"]["Enums"]["work_locations"] | null
          work_schedule: string | null
          work_shedule_interval: string | null
        }
        Insert: {
          additional_offerings?: Json[] | null
          created_at?: string
          direct_report?: number | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity: number
          fixed_allowance?: Json | null
          id?: number
          job_title: string
          level?: number | null
          level_name?: string | null
          maternity_leave?: number | null
          maternity_leave_used?: number | null
          offboarding?: number | null
          onboarding?: number | null
          org: string
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          paid_leave_used?: number
          paternity_leave?: number | null
          paternity_leave_used?: number
          probation_period?: number | null
          profile?: string | null
          profile_signature_string?: string | null
          profile_signed?: string | null
          responsibilities?: Json | null
          role?: number | null
          salary?: number
          sick_leave?: number | null
          sick_leave_used?: number
          signed_by?: string | null
          signing_bonus?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_state"]
          team?: number | null
          terminated_by?: string | null
          unpaid_leave_used?: number | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Update: {
          additional_offerings?: Json[] | null
          created_at?: string
          direct_report?: number | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity?: number
          fixed_allowance?: Json | null
          id?: number
          job_title?: string
          level?: number | null
          level_name?: string | null
          maternity_leave?: number | null
          maternity_leave_used?: number | null
          offboarding?: number | null
          onboarding?: number | null
          org?: string
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          paid_leave_used?: number
          paternity_leave?: number | null
          paternity_leave_used?: number
          probation_period?: number | null
          profile?: string | null
          profile_signature_string?: string | null
          profile_signed?: string | null
          responsibilities?: Json | null
          role?: number | null
          salary?: number
          sick_leave?: number | null
          sick_leave_used?: number
          signed_by?: string | null
          signing_bonus?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_state"]
          team?: number | null
          terminated_by?: string | null
          unpaid_leave_used?: number | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_direct_report_fkey"
            columns: ["direct_report"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_level_fkey"
            columns: ["level"]
            isOneToOne: false
            referencedRelation: "employee_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_offboarding_fkey"
            columns: ["offboarding"]
            isOneToOne: false
            referencedRelation: "boarding_check_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_onboarding_fkey"
            columns: ["onboarding"]
            isOneToOne: false
            referencedRelation: "boarding_check_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "contracts_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "open_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_terminated_by_fkey"
            columns: ["terminated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          can_legal_entity: boolean
          country_code: string
          created_at: string
          currency_code: string | null
          currency_name: string | null
          dial_code: string
          id: number
          name: string
        }
        Insert: {
          can_legal_entity?: boolean
          country_code: string
          created_at?: string
          currency_code?: string | null
          currency_name?: string | null
          dial_code: string
          id?: number
          name: string
        }
        Update: {
          can_legal_entity?: boolean
          country_code?: string
          created_at?: string
          currency_code?: string | null
          currency_name?: string | null
          dial_code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          contracts: number
          created_at: string
          id: number
          org: string
          signed_contracts: number | null
        }
        Insert: {
          contracts?: number
          created_at?: string
          id?: number
          org: string
          signed_contracts?: number | null
        }
        Update: {
          contracts?: number
          created_at?: string
          id?: number
          org?: string
          signed_contracts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_stats_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      documents: {
        Row: {
          contract_variables: string[]
          created_at: string
          editors: string[]
          entity: number | null
          html: string
          id: number
          json: string | null
          locked: boolean
          name: string
          org: string
          owner: string
          private: boolean
          template: boolean
          updated_at: string
        }
        Insert: {
          contract_variables?: string[]
          created_at?: string
          editors: string[]
          entity?: number | null
          html?: string
          id?: number
          json?: string | null
          locked?: boolean
          name?: string
          org: string
          owner?: string
          private?: boolean
          template?: boolean
          updated_at?: string
        }
        Update: {
          contract_variables?: string[]
          created_at?: string
          editors?: string[]
          entity?: number | null
          html?: string
          id?: number
          json?: string | null
          locked?: boolean
          name?: string
          org?: string
          owner?: string
          private?: boolean
          template?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      employee_levels: {
        Row: {
          created_at: string
          entity: number | null
          fixed_allowance: Json[] | null
          id: number
          level: string
          max_salary: number
          max_signing_bonus: number | null
          min_salary: number
          min_signing_bonus: number | null
          org: string
          role: string | null
        }
        Insert: {
          created_at?: string
          entity?: number | null
          fixed_allowance?: Json[] | null
          id?: number
          level: string
          max_salary?: number
          max_signing_bonus?: number | null
          min_salary: number
          min_signing_bonus?: number | null
          org: string
          role?: string | null
        }
        Update: {
          created_at?: string
          entity?: number | null
          fixed_allowance?: Json[] | null
          id?: number
          level?: string
          max_salary?: number
          max_signing_bonus?: number | null
          min_salary?: number
          min_signing_bonus?: number | null
          org?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_levels_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_levels_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      inbox: {
        Row: {
          created_at: string
          draft: boolean | null
          entity: number | null
          id: number
          message: string
          org: string
          read: Json[]
          send_time: string | null
          sender_profile: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          draft?: boolean | null
          entity?: number | null
          id?: number
          message: string
          org: string
          read?: Json[]
          send_time?: string | null
          sender_profile: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          draft?: boolean | null
          entity?: number | null
          id?: number
          message?: string
          org?: string
          read?: Json[]
          send_time?: string | null
          sender_profile?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbox_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "inbox_sender_profile_fkey"
            columns: ["sender_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          country_location: string | null
          cover_letter: string | null
          cover_letter_url: string | null
          created_at: string
          custom_answers: Json[] | null
          disability: string | null
          documents: Json[]
          email: string
          first_name: string
          gender: string | null
          id: number
          last_name: string
          levels: Json[]
          links: Json | null
          org: string
          phone_number: string | null
          race_ethnicity: string | null
          require_sponsorship: boolean | null
          resume: string | null
          resume_url: string | null
          role: number
          stage: string
          state_location: string | null
          veterian_status: string | null
          work_authorization: boolean | null
        }
        Insert: {
          country_location?: string | null
          cover_letter?: string | null
          cover_letter_url?: string | null
          created_at?: string
          custom_answers?: Json[] | null
          disability?: string | null
          documents?: Json[]
          email: string
          first_name: string
          gender?: string | null
          id?: number
          last_name: string
          levels?: Json[]
          links?: Json | null
          org: string
          phone_number?: string | null
          race_ethnicity?: string | null
          require_sponsorship?: boolean | null
          resume?: string | null
          resume_url?: string | null
          role: number
          stage?: string
          state_location?: string | null
          veterian_status?: string | null
          work_authorization?: boolean | null
        }
        Update: {
          country_location?: string | null
          cover_letter?: string | null
          cover_letter_url?: string | null
          created_at?: string
          custom_answers?: Json[] | null
          disability?: string | null
          documents?: Json[]
          email?: string
          first_name?: string
          gender?: string | null
          id?: number
          last_name?: string
          levels?: Json[]
          links?: Json | null
          org?: string
          phone_number?: string | null
          race_ethnicity?: string | null
          require_sponsorship?: boolean | null
          resume?: string | null
          resume_url?: string | null
          role?: number
          stage?: string
          state_location?: string | null
          veterian_status?: string | null
          work_authorization?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_country_location_fkey"
            columns: ["country_location"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "job_applications_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "job_applications_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "open_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_entities: {
        Row: {
          address_code: string | null
          address_state: number
          company_type: string | null
          created_at: string
          formation_date: string | null
          id: number
          incorporation_country: string
          is_eor: boolean
          name: string
          org: string
          rn: string | null
          sic: string | null
          street_address: string | null
          tax_no: string | null
          updated_at: string
        }
        Insert: {
          address_code?: string | null
          address_state?: number
          company_type?: string | null
          created_at?: string
          formation_date?: string | null
          id?: number
          incorporation_country: string
          is_eor?: boolean
          name: string
          org: string
          rn?: string | null
          sic?: string | null
          street_address?: string | null
          tax_no?: string | null
          updated_at?: string
        }
        Update: {
          address_code?: string | null
          address_state?: number
          company_type?: string | null
          created_at?: string
          formation_date?: string | null
          id?: number
          incorporation_country?: string
          is_eor?: boolean
          name?: string
          org?: string
          rn?: string | null
          sic?: string | null
          street_address?: string | null
          tax_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_entities_address_state_fkey"
            columns: ["address_state"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_entities_incorporation_country_fkey"
            columns: ["incorporation_country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "legal_entities_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          entity: number | null
          id: number
          link: string
          name: string
          org: string
          path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity?: number | null
          id?: number
          link: string
          name: string
          org: string
          path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity?: number | null
          id?: number
          link?: string
          name?: string
          org?: string
          path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      managers: {
        Row: {
          created_at: string
          id: number
          org: string
          person: number | null
          profile: string | null
          role: number
          team: number
        }
        Insert: {
          created_at?: string
          id?: number
          org: string
          person?: number | null
          profile?: string | null
          role: number
          team: number
        }
        Update: {
          created_at?: string
          id?: number
          org?: string
          person?: number | null
          profile?: string | null
          role?: number
          team?: number
        }
        Relationships: [
          {
            foreignKeyName: "managers_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "managers_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_role_fkey1"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          contracts: number[] | null
          created_at: string
          for: Database["public"]["Enums"]["user_type"]
          id: number
          link: string | null
          org: string
          read: string[]
          schedule_at: string | null
          sender_contract: number | null
          sender_profile: string | null
          title: string
        }
        Insert: {
          body?: string
          contracts?: number[] | null
          created_at?: string
          for: Database["public"]["Enums"]["user_type"]
          id?: number
          link?: string | null
          org: string
          read?: string[]
          schedule_at?: string | null
          sender_contract?: number | null
          sender_profile?: string | null
          title: string
        }
        Update: {
          body?: string
          contracts?: number[] | null
          created_at?: string
          for?: Database["public"]["Enums"]["user_type"]
          id?: number
          link?: string | null
          org?: string
          read?: string[]
          schedule_at?: string | null
          sender_contract?: number | null
          sender_profile?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "notifications_sender_contract_fkey"
            columns: ["sender_contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_profile_fkey"
            columns: ["sender_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_objectives: {
        Row: {
          created_at: string
          entity: number | null
          id: number
          objective: string
          okr: number
          org: string
        }
        Insert: {
          created_at?: string
          entity?: number | null
          id?: number
          objective: string
          okr: number
          org: string
        }
        Update: {
          created_at?: string
          entity?: number | null
          id?: number
          objective?: string
          okr?: number
          org?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_okr_fkey"
            columns: ["okr"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      okr_results: {
        Row: {
          created_at: string
          entity: number | null
          id: number
          okr: number
          okr_objective: number
          org: string
          result: string
        }
        Insert: {
          created_at?: string
          entity?: number | null
          id?: number
          okr: number
          okr_objective: number
          org: string
          result: string
        }
        Update: {
          created_at?: string
          entity?: number | null
          id?: number
          okr?: number
          okr_objective?: number
          org?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_results_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_results_okr_fkey"
            columns: ["okr"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_results_okr_objective_fkey"
            columns: ["okr_objective"]
            isOneToOne: false
            referencedRelation: "okr_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_results_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      okrs: {
        Row: {
          created_at: string
          end: string
          entity: number | null
          id: number
          org: string
          start: string
          title: string
        }
        Insert: {
          created_at?: string
          end: string
          entity?: number | null
          id?: number
          org: string
          start: string
          title: string
        }
        Update: {
          created_at?: string
          end?: string
          entity?: number | null
          id?: number
          org?: string
          start?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "okrs_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okrs_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      open_roles: {
        Row: {
          additional_offerings: Json[] | null
          applicants: number
          compensation_public: boolean
          created_at: string
          custom_fields: Json[] | null
          direct_report: number | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          enable_location: boolean
          enable_voluntary_data: boolean
          entity: number
          fixed_allowance: Json | null
          id: number
          is_manager: boolean
          job_title: string
          level: number | null
          level_name: string | null
          org: string
          paid_leave: number | null
          policy: number | null
          probation_period: number | null
          requirements: Json[] | null
          responsibilities: Json | null
          salary: number | null
          sick_leave: number | null
          signing_bonus: number | null
          state: Database["public"]["Enums"]["is_open"]
          team: number | null
          work_location: Database["public"]["Enums"]["work_locations"] | null
          work_schedule: string | null
          work_shedule_interval: string | null
          years_of_experience: number | null
        }
        Insert: {
          additional_offerings?: Json[] | null
          applicants?: number
          compensation_public?: boolean
          created_at?: string
          custom_fields?: Json[] | null
          direct_report?: number | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          enable_location?: boolean
          enable_voluntary_data?: boolean
          entity: number
          fixed_allowance?: Json | null
          id?: number
          is_manager?: boolean
          job_title: string
          level?: number | null
          level_name?: string | null
          org: string
          paid_leave?: number | null
          policy?: number | null
          probation_period?: number | null
          requirements?: Json[] | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state: Database["public"]["Enums"]["is_open"]
          team?: number | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Update: {
          additional_offerings?: Json[] | null
          applicants?: number
          compensation_public?: boolean
          created_at?: string
          custom_fields?: Json[] | null
          direct_report?: number | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          enable_location?: boolean
          enable_voluntary_data?: boolean
          entity?: number
          fixed_allowance?: Json | null
          id?: number
          is_manager?: boolean
          job_title?: string
          level?: number | null
          level_name?: string | null
          org?: string
          paid_leave?: number | null
          policy?: number | null
          probation_period?: number | null
          requirements?: Json[] | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state?: Database["public"]["Enums"]["is_open"]
          team?: number | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "open_roles_direct_report_fkey"
            columns: ["direct_report"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_roles_policy_fkey"
            columns: ["policy"]
            isOneToOne: false
            referencedRelation: "approval_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_roles_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_contract_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_contract_level_fkey"
            columns: ["level"]
            isOneToOne: false
            referencedRelation: "employee_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_contract_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      org_documents: {
        Row: {
          created_at: string
          entity: number | null
          eor_entity: number | null
          id: number
          link: string | null
          name: string
          org: string | null
          profile: string | null
          signature_text: string | null
          signed_by: string | null
          type: string
        }
        Insert: {
          created_at?: string
          entity?: number | null
          eor_entity?: number | null
          id?: number
          link?: string | null
          name: string
          org?: string | null
          profile?: string | null
          signature_text?: string | null
          signed_by?: string | null
          type: string
        }
        Update: {
          created_at?: string
          entity?: number | null
          eor_entity?: number | null
          id?: number
          link?: string | null
          name?: string
          org?: string | null
          profile?: string | null
          signature_text?: string | null
          signed_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_documents_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_documents_eor_entity_fkey"
            columns: ["eor_entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_documents_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "org_documents_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          about_us: string | null
          additional_offerings: Json[] | null
          calendar_employee_events: string[] | null
          created_at: string
          enable_calendar: boolean
          enable_task_manager: boolean
          id: number
          maternity_leave: number | null
          org: string
          paid_leave: number | null
          paternity_leave: number | null
          plane_key: string | null
          plane_project: string | null
          plane_workspace_slug: string | null
          probation: number | null
          salary_date: string | null
          sick_leave: number | null
          work_schedule: string | null
          work_shedule_interval: string | null
        }
        Insert: {
          about_us?: string | null
          additional_offerings?: Json[] | null
          calendar_employee_events?: string[] | null
          created_at?: string
          enable_calendar?: boolean
          enable_task_manager?: boolean
          id?: number
          maternity_leave?: number | null
          org: string
          paid_leave?: number | null
          paternity_leave?: number | null
          plane_key?: string | null
          plane_project?: string | null
          plane_workspace_slug?: string | null
          probation?: number | null
          salary_date?: string | null
          sick_leave?: number | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Update: {
          about_us?: string | null
          additional_offerings?: Json[] | null
          calendar_employee_events?: string[] | null
          created_at?: string
          enable_calendar?: boolean
          enable_task_manager?: boolean
          id?: number
          maternity_leave?: number | null
          org?: string
          paid_leave?: number | null
          paternity_leave?: number | null
          plane_key?: string | null
          plane_project?: string | null
          plane_workspace_slug?: string | null
          probation?: number | null
          salary_date?: string | null
          sick_leave?: number | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_fkey"
            columns: ["org"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: number
          name: string
          subdomain: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string
          subdomain: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          subdomain?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      platform_thirdparty_keys: {
        Row: {
          created_at: string
          id: number
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id: string | null
          refresh_token: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: number
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id?: string | null
          refresh_token: string
          token: string
        }
        Update: {
          created_at?: string
          id?: number
          platform?: Database["public"]["Enums"]["third_party_auth_platforms"]
          platform_id?: string | null
          refresh_token?: string
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          date_of_birth: string | null
          email: string
          emergency_contact: Json | null
          fcm_token: string[]
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical: Json | null
          mobile: string | null
          nationality: string | null
          org: string | null
        }
        Insert: {
          address?: Json | null
          date_of_birth?: string | null
          email: string
          emergency_contact?: Json | null
          fcm_token?: string[]
          first_name: string
          gender?: string | null
          id: string
          last_name: string
          medical?: Json | null
          mobile?: string | null
          nationality?: string | null
          org?: string | null
        }
        Update: {
          address?: Json | null
          date_of_birth?: string | null
          email?: string
          emergency_contact?: Json | null
          fcm_token?: string[]
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical?: Json | null
          mobile?: string | null
          nationality?: string | null
          org?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_nationality_fkey"
            columns: ["nationality"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "profiles_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      profiles_roles: {
        Row: {
          created_at: string
          disable: boolean
          id: number
          organisation: string
          profile: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          disable?: boolean
          id?: number
          organisation: string
          profile?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          disable?: boolean
          id?: number
          organisation?: string
          profile?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_roles_organisation_fkey"
            columns: ["organisation"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "profiles_roles_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_roles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      reminders: {
        Row: {
          contract: number
          created_at: string
          datetime: string
          description: string | null
          id: number
          org: string
          profile: string | null
          title: string
          type: string | null
        }
        Insert: {
          contract: number
          created_at?: string
          datetime: string
          description?: string | null
          id?: number
          org: string
          profile?: string | null
          title: string
          type?: string | null
        }
        Update: {
          contract?: number
          created_at?: string
          datetime?: string
          description?: string | null
          id?: number
          org?: string
          profile?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_contract_fkey"
            columns: ["contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "reminders_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      states: {
        Row: {
          country_code: string
          id: number
          name: string
          short_code: string
        }
        Insert: {
          country_code: string
          id?: number
          name: string
          short_code: string
        }
        Update: {
          country_code?: string
          id?: number
          name?: string
          short_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      team_roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          org: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          org: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          org?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
      third_party_tokens: {
        Row: {
          created_at: string
          id: number
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          profile: string
          refresh_token: string | null
          token: string
        }
        Insert: {
          created_at?: string
          id?: number
          platform: Database["public"]["Enums"]["third_party_auth_platforms"]
          profile?: string
          refresh_token?: string | null
          token: string
        }
        Update: {
          created_at?: string
          id?: number
          platform?: Database["public"]["Enums"]["third_party_auth_platforms"]
          profile?: string
          refresh_token?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "third_party_tokens_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          approved_at: string | null
          contract: number
          created_at: string | null
          from: string
          hand_over: number | null
          hand_over_note: string | null
          id: number
          leave_type: Database["public"]["Enums"]["leave_type_enum"]
          levels: Json[] | null
          note: string | null
          org: string
          profile: string
          status: Database["public"]["Enums"]["leave_status_enum"]
          to: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          contract: number
          created_at?: string | null
          from: string
          hand_over?: number | null
          hand_over_note?: string | null
          id?: never
          leave_type: Database["public"]["Enums"]["leave_type_enum"]
          levels?: Json[] | null
          note?: string | null
          org: string
          profile: string
          status: Database["public"]["Enums"]["leave_status_enum"]
          to: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          contract?: number
          created_at?: string | null
          from?: string
          hand_over?: number | null
          hand_over_note?: string | null
          id?: never
          leave_type?: Database["public"]["Enums"]["leave_type_enum"]
          levels?: Json[] | null
          note?: string | null
          org?: string
          profile?: string
          status?: Database["public"]["Enums"]["leave_status_enum"]
          to?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_contract_fkey"
            columns: ["contract"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_hand_over_fkey"
            columns: ["hand_over"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "time_off_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize_role: {
        Args: {
          org_name: string
        }
        Returns: boolean
      }
      check_contract_exists: {
        Args: {
          p_profile_id: string
          p_contract_id: number
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin"
      boarding_state: "initial" | "pending" | "approved"
      boarding_type: "on" | "off"
      contract_state:
        | "awaiting signatures"
        | "awaiting org signature"
        | "awaiting signature"
        | "signed"
        | "inactive"
        | "terminated"
        | "scheduled termination"
      contract_type: "employee" | "contractor"
      employment_type: "full-time" | "part-time" | "contract"
      is_open: "open" | "closed" | "partial"
      leave_status_enum:
        | "pending"
        | "denied"
        | "approved"
        | "more"
        | "cancelled"
      leave_type_enum: "paid" | "sick" | "maternity" | "paternity" | "unpaid"
      policy_types: "time_off" | "role_application" | "boarding"
      role_status: "open" | "close"
      third_party_auth_platforms: "google"
      user_type: "admin" | "employee"
      work_locations: "on-site" | "remote" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

