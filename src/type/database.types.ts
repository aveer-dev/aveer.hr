export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			contracts: {
				Row: {
					created_at: string;
					employment_type: string | null;
					end_date: string | null;
					fixed_allowance: Json | null;
					id: number;
					job_title: string;
					level: string | null;
					paid_leave: number | null;
					probation_period: number | null;
					responsibilities: Json | null;
					salary: number | null;
					sick_leave: number | null;
					signing_bonus: number | null;
					start_date: string | null;
					work_schedule: string | null;
					work_shedule_interval: string | null;
				};
				Insert: {
					created_at?: string;
					employment_type?: string | null;
					end_date?: string | null;
					fixed_allowance?: Json | null;
					id?: number;
					job_title: string;
					level?: string | null;
					paid_leave?: number | null;
					probation_period?: number | null;
					responsibilities?: Json | null;
					salary?: number | null;
					sick_leave?: number | null;
					signing_bonus?: number | null;
					start_date?: string | null;
					work_schedule?: string | null;
					work_shedule_interval?: string | null;
				};
				Update: {
					created_at?: string;
					employment_type?: string | null;
					end_date?: string | null;
					fixed_allowance?: Json | null;
					id?: number;
					job_title?: string;
					level?: string | null;
					paid_leave?: number | null;
					probation_period?: number | null;
					responsibilities?: Json | null;
					salary?: number | null;
					sick_leave?: number | null;
					signing_bonus?: number | null;
					start_date?: string | null;
					work_schedule?: string | null;
					work_shedule_interval?: string | null;
				};
				Relationships: [];
			};
			countries: {
				Row: {
					country_code: string;
					created_at: string;
					dial_code: string;
					id: number;
					name: string;
				};
				Insert: {
					country_code: string;
					created_at?: string;
					dial_code: string;
					id?: number;
					name: string;
				};
				Update: {
					country_code?: string;
					created_at?: string;
					dial_code?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			legal_entities: {
				Row: {
					address_code: string | null;
					address_state: number;
					company_type: string | null;
					created_at: string;
					ein: string | null;
					formation_date: string | null;
					id: number;
					incorporation_country: string | null;
					name: string;
					sic: string | null;
					street_address: string | null;
					updated_at: string;
				};
				Insert: {
					address_code?: string | null;
					address_state?: number;
					company_type?: string | null;
					created_at?: string;
					ein?: string | null;
					formation_date?: string | null;
					id?: number;
					incorporation_country?: string | null;
					name: string;
					sic?: string | null;
					street_address?: string | null;
					updated_at?: string;
				};
				Update: {
					address_code?: string | null;
					address_state?: number;
					company_type?: string | null;
					created_at?: string;
					ein?: string | null;
					formation_date?: string | null;
					id?: number;
					incorporation_country?: string | null;
					name?: string;
					sic?: string | null;
					street_address?: string | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'legal_entities_address_state_fkey';
						columns: ['address_state'];
						isOneToOne: false;
						referencedRelation: 'states';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'legal_entities_incorporation_country_fkey';
						columns: ['incorporation_country'];
						isOneToOne: false;
						referencedRelation: 'countries';
						referencedColumns: ['country_code'];
					}
				];
			};
			organisations: {
				Row: {
					created_at: string;
					id: number;
					name: string;
					updated_at: string;
					website: string | null;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name?: string;
					updated_at?: string;
					website?: string | null;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
					updated_at?: string;
					website?: string | null;
				};
				Relationships: [];
			};
			organisations_legal_entities: {
				Row: {
					created_at: string;
					id: number;
					legal_ent_id: number;
					org_id: number;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					id?: number;
					legal_ent_id: number;
					org_id: number;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					id?: number;
					legal_ent_id?: number;
					org_id?: number;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'organisations_legal_entitys_legal_ent_id_fkey';
						columns: ['legal_ent_id'];
						isOneToOne: false;
						referencedRelation: 'legal_entities';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'organisations_legal_entitys_org_id_fkey';
						columns: ['org_id'];
						isOneToOne: false;
						referencedRelation: 'organisations';
						referencedColumns: ['id'];
					}
				];
			};
			profiles: {
				Row: {
					email: string;
					first_name: string;
					id: string;
					last_name: string;
					nationality: string | null;
					org: number | null;
				};
				Insert: {
					email: string;
					first_name: string;
					id: string;
					last_name: string;
					nationality?: string | null;
					org?: number | null;
				};
				Update: {
					email?: string;
					first_name?: string;
					id?: string;
					last_name?: string;
					nationality?: string | null;
					org?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'profiles_nationality_fkey';
						columns: ['nationality'];
						isOneToOne: false;
						referencedRelation: 'countries';
						referencedColumns: ['country_code'];
					},
					{
						foreignKeyName: 'profiles_org_fkey';
						columns: ['org'];
						isOneToOne: false;
						referencedRelation: 'organisations';
						referencedColumns: ['id'];
					}
				];
			};
			profiles_contracts: {
				Row: {
					contract: number;
					created_at: string;
					id: number;
					profile: string;
					updated_at: string;
				};
				Insert: {
					contract: number;
					created_at?: string;
					id?: number;
					profile: string;
					updated_at?: string;
				};
				Update: {
					contract?: number;
					created_at?: string;
					id?: number;
					profile?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_contracts_contract_fkey';
						columns: ['contract'];
						isOneToOne: false;
						referencedRelation: 'contracts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'profiles_contracts_profile_fkey';
						columns: ['profile'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			profiles_roles: {
				Row: {
					created_at: string;
					id: number;
					profile: string;
					role: number;
				};
				Insert: {
					created_at?: string;
					id?: number;
					profile: string;
					role: number;
				};
				Update: {
					created_at?: string;
					id?: number;
					profile?: string;
					role?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_roles_profile_fkey';
						columns: ['profile'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_roles_role_fkey';
						columns: ['role'];
						isOneToOne: false;
						referencedRelation: 'roles';
						referencedColumns: ['id'];
					}
				];
			};
			roles: {
				Row: {
					created_at: string;
					description: string | null;
					id: number;
					name: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					id?: number;
					name?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			states: {
				Row: {
					country_code: string;
					id: number;
					name: string;
					short_code: string;
				};
				Insert: {
					country_code: string;
					id?: number;
					name: string;
					short_code: string;
				};
				Update: {
					country_code?: string;
					id?: number;
					name?: string;
					short_code?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'states_country_code_fkey';
						columns: ['country_code'];
						isOneToOne: false;
						referencedRelation: 'countries';
						referencedColumns: ['country_code'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views']) : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums'] : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database } ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName] : PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] ? PublicSchema['Enums'][PublicEnumNameOrOptions] : never;
