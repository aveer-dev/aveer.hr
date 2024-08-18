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
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date: string | null
          entity: number
          fixed_allowance: Json | null
          id: number
          job_title: string
          level: string | null
          org: string | null
          org_signature_string: string | null
          org_signed: string | null
          paid_leave: number | null
          probation_period: number | null
          profile: string | null
          profile_signature_string: string | null
          profile_signed: string | null
          responsibilities: Json | null
          salary: number | null
          sick_leave: number | null
          signed_by: string | null
          signing_bonus: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_state"]
          terminated_by: string | null
          work_schedule: string | null
          work_shedule_interval: string | null
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity: number
          fixed_allowance?: Json | null
          id?: number
          job_title: string
          level?: string | null
          org?: string | null
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          probation_period?: number | null
          profile?: string | null
          profile_signature_string?: string | null
          profile_signed?: string | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signed_by?: string | null
          signing_bonus?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_state"]
          terminated_by?: string | null
          work_schedule?: string | null
          work_shedule_interval?: string | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          entity?: number
          fixed_allowance?: Json | null
          id?: number
          job_title?: string
          level?: string | null
          org?: string | null
          org_signature_string?: string | null
          org_signed?: string | null
          paid_leave?: number | null
          probation_period?: number | null
          profile?: string | null
          profile_signature_string?: string | null
          profile_signed?: string | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signed_by?: string | null
          signing_bonus?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_state"]
          terminated_by?: string | null
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
          country_code: string
          created_at: string
          dial_code: string
          id: number
          name: string
        }
        Insert: {
          country_code: string
          created_at?: string
          dial_code: string
          id?: number
          name: string
        }
        Update: {
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
      legal_entities: {
        Row: {
          address_code: string | null
          address_state: number
          company_type: string | null
          created_at: string
          ein: string | null
          formation_date: string | null
          id: number
          incorporation_country: string
          is_eor: boolean
          name: string
          org: string
          sic: string | null
          street_address: string | null
          updated_at: string
        }
        Insert: {
          address_code?: string | null
          address_state?: number
          company_type?: string | null
          created_at?: string
          ein?: string | null
          formation_date?: string | null
          id?: number
          incorporation_country: string
          is_eor?: boolean
          name: string
          org: string
          sic?: string | null
          street_address?: string | null
          updated_at?: string
        }
        Update: {
          address_code?: string | null
          address_state?: number
          company_type?: string | null
          created_at?: string
          ein?: string | null
          formation_date?: string | null
          id?: number
          incorporation_country?: string
          is_eor?: boolean
          name?: string
          org?: string
          sic?: string | null
          street_address?: string | null
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
          about_us: string | null
          country: string | null
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          entity: number | null
          fixed_allowance: Json[] | null
          id: number
          job_title: string
          level: string | null
          no_applicants: number
          org: string
          paid_leave: number | null
          probation_period: number | null
          requirements: Json | null
          responsibilities: Json | null
          salary: number | null
          sick_leave: number | null
          signing_bonus: number | null
          state: number | null
          status: Database["public"]["Enums"]["role_status"]
          what_we_offer: Json | null
          work_location: Database["public"]["Enums"]["work_locations"]
          work_schedule: number | null
          work_shedule_interval: string | null
          years_of_experience: number | null
        }
        Insert: {
          about_us?: string | null
          country?: string | null
          created_at?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          entity?: number | null
          fixed_allowance?: Json[] | null
          id?: number
          job_title: string
          level?: string | null
          no_applicants?: number
          org: string
          paid_leave?: number | null
          probation_period?: number | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state?: number | null
          status?: Database["public"]["Enums"]["role_status"]
          what_we_offer?: Json | null
          work_location: Database["public"]["Enums"]["work_locations"]
          work_schedule?: number | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Update: {
          about_us?: string | null
          country?: string | null
          created_at?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          entity?: number | null
          fixed_allowance?: Json[] | null
          id?: number
          job_title?: string
          level?: string | null
          no_applicants?: number
          org?: string
          paid_leave?: number | null
          probation_period?: number | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary?: number | null
          sick_leave?: number | null
          signing_bonus?: number | null
          state?: number | null
          status?: Database["public"]["Enums"]["role_status"]
          what_we_offer?: Json | null
          work_location?: Database["public"]["Enums"]["work_locations"]
          work_schedule?: number | null
          work_shedule_interval?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "open_roles_entity_fkey"
            columns: ["entity"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_roles_org_fkey"
            columns: ["org"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["subdomain"]
          },
          {
            foreignKeyName: "open-roles_state_fkey"
            columns: ["state"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
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
      employment_type: "full-time" | "part-time"
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
