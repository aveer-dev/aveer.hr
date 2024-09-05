export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contracts: {
        Row: {
          additional_offerings: Json[] | null
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date: string | null
          entity: number
          fixed_allowance: Json | null
          id: number
          job_title: string
          level: number | null
          level_name: string | null
          org: string
          org_signature_string: string | null
          org_signed: string | null
          paid_leave: number | null
          paid_leave_used: number
          paternity_maternity_used: number
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
          terminated_by: string | null
          work_location: Database["public"]["Enums"]["work_locations"] | null
          work_schedule: string | null
          work_shedule_interval: string | null
        }
        Insert: {
          additional_offerings?: Json[] | null
          created_at?: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity: number
          fixed_allowance?: Json | null
          id?: number
          job_title: string
          level?: number | null
          level_name?: string | null
          org: string
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          paid_leave_used?: number
          paternity_maternity_used?: number
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
          terminated_by?: string | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Update: {
          additional_offerings?: Json[] | null
          created_at?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity?: number
          fixed_allowance?: Json | null
          id?: number
          job_title?: string
          level?: number | null
          level_name?: string | null
          org?: string
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          paid_leave_used?: number
          paternity_maternity_used?: number
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
          terminated_by?: string | null
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Relationships: [
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
          dial_code: string
          id: number
          name: string
        }
        Insert: {
          can_legal_entity?: boolean
          country_code: string
          created_at?: string
          dial_code: string
          id?: number
          name: string
        }
        Update: {
          can_legal_entity?: boolean
          country_code?: string
          created_at?: string
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
          links: Json | null
          org: string
          phone_number: string | null
          race_ethnicity: string
          require_sponsorship: boolean
          resume: string | null
          resume_url: string | null
          role: number
          stage: string
          state_location: string
          veterian_status: string | null
          work_authorization: boolean
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
          links?: Json | null
          org: string
          phone_number?: string | null
          race_ethnicity: string
          require_sponsorship: boolean
          resume?: string | null
          resume_url?: string | null
          role: number
          stage?: string
          state_location: string
          veterian_status?: string | null
          work_authorization: boolean
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
          links?: Json | null
          org?: string
          phone_number?: string | null
          race_ethnicity?: string
          require_sponsorship?: boolean
          resume?: string | null
          resume_url?: string | null
          role?: number
          stage?: string
          state_location?: string
          veterian_status?: string | null
          work_authorization?: boolean
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
      open_roles: {
        Row: {
          additional_offerings: Json[] | null
          applicants: number
          created_at: string
          custom_fields: Json[] | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          entity: number
          fixed_allowance: Json | null
          id: number
          job_title: string
          level: number | null
          level_name: string | null
          org: string
          paid_leave: number | null
          probation_period: number | null
          requirements: Json[] | null
          responsibilities: Json | null
          salary: number | null
          sick_leave: number | null
          signing_bonus: number | null
          state: Database["public"]["Enums"]["is_open"]
          work_location: Database["public"]["Enums"]["work_locations"] | null
          work_schedule: string | null
          work_shedule_interval: string | null
          years_of_experience: number | null
        }
        Insert: {
          additional_offerings?: Json[] | null
          applicants?: number
          created_at?: string
          custom_fields?: Json[] | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          entity: number
          fixed_allowance?: Json | null
          id?: number
          job_title: string
          level?: number | null
          level_name?: string | null
          org: string
          paid_leave?: number | null
          probation_period?: number | null
          requirements?: Json[] | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state: Database["public"]["Enums"]["is_open"]
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Update: {
          additional_offerings?: Json[] | null
          applicants?: number
          created_at?: string
          custom_fields?: Json[] | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          entity?: number
          fixed_allowance?: Json | null
          id?: number
          job_title?: string
          level?: number | null
          level_name?: string | null
          org?: string
          paid_leave?: number | null
          probation_period?: number | null
          requirements?: Json[] | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state?: Database["public"]["Enums"]["is_open"]
          work_location?: Database["public"]["Enums"]["work_locations"] | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
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
          created_at: string
          id: number
          org: string
          paid_time_off: number | null
          probation: number | null
          sick_leave: number | null
          work_schedule: string | null
          work_shedule_interval: string | null
        }
        Insert: {
          about_us?: string | null
          additional_offerings?: Json[] | null
          created_at?: string
          id?: number
          org: string
          paid_time_off?: number | null
          probation?: number | null
          sick_leave?: number | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Update: {
          about_us?: string | null
          additional_offerings?: Json[] | null
          created_at?: string
          id?: number
          org?: string
          paid_time_off?: number | null
          probation?: number | null
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
      profiles: {
        Row: {
          email: string
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          org: string | null
        }
        Insert: {
          email: string
          first_name: string
          id: string
          last_name: string
          nationality?: string | null
          org?: string | null
        }
        Update: {
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          org?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          id: number
          organisation: string | null
          profile: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: number
          organisation?: string | null
          profile?: string
          role: string
        }
        Update: {
          created_at?: string
          id?: number
          organisation?: string | null
          profile?: string
          role?: string
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
      roles: {
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
          name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
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
      time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contract_id: number
          created_at: string | null
          employee_id: string
          from: string
          hand_over: string | null
          hand_over_note: string | null
          id: number
          leave_type: Database["public"]["Enums"]["leave_type_enum"]
          note: string | null
          org: string
          status: Database["public"]["Enums"]["leave_status_enum"]
          to: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contract_id: number
          created_at?: string | null
          employee_id: string
          from: string
          hand_over?: string | null
          hand_over_note?: string | null
          id?: never
          leave_type: Database["public"]["Enums"]["leave_type_enum"]
          note?: string | null
          org: string
          status: Database["public"]["Enums"]["leave_status_enum"]
          to: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contract_id?: number
          created_at?: string | null
          employee_id?: string
          from?: string
          hand_over?: string | null
          hand_over_note?: string | null
          id?: never
          leave_type?: Database["public"]["Enums"]["leave_type_enum"]
          note?: string | null
          org?: string
          status?: Database["public"]["Enums"]["leave_status_enum"]
          to?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_hand_over_fkey"
            columns: ["hand_over"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      role_status: "open" | "close"
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
