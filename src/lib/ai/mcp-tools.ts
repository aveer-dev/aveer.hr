import { MCPTool } from '@/type/ai-chat.types';
import { createClient } from '@/utils/supabase/client';

// Create supabase client
const supabase = createClient();

// Employee Management Tools
export const employeeTools: MCPTool[] = [
  {
    name: 'getEmployeeInfo',
    description: 'Get information about an employee by their ID or email',
    inputSchema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Employee ID, contract ID, or email',
        },
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
      },
      required: ['identifier', 'org'],
    },
    handler: async ({ identifier, org }) => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          contracts!inner(*)
        `)
        .eq('org', org)
        .or(`email.eq.${identifier},contracts.id.eq.${identifier}`)
        .single();

      if (error) throw error;
      return data;
    },
  },

  {
    name: 'searchEmployees',
    description: 'Search for employees by name, role, or team',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
        filters: {
          type: 'object',
          properties: {
            team: { type: 'string' },
            status: { type: 'string' },
            entity: { type: 'number' },
          },
        },
      },
      required: ['query', 'org'],
    },
    handler: async ({ query, org, filters }) => {
      let queryBuilder = supabase
        .from('contracts')
        .select(`
          *,
          profile:profiles!inner(*),
          team:teams(*),
          entity:legal_entities(*)
        `)
        .eq('org', org)
        .or(`profile.first_name.ilike.%${query}%,profile.last_name.ilike.%${query}%,job_title.ilike.%${query}%`);

      if (filters?.team) {
        queryBuilder = queryBuilder.eq('team', filters.team);
      }
      if (filters?.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }
      if (filters?.entity) {
        queryBuilder = queryBuilder.eq('entity', filters.entity);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  },

  {
    name: 'getTeamInfo',
    description: 'Get information about a team including members',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'number',
          description: 'Team ID',
        },
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
      },
      required: ['teamId', 'org'],
    },
    handler: async ({ teamId, org }) => {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .eq('org', org)
        .single();

      if (teamError) throw teamError;

      const { data: members, error: membersError } = await supabase
        .from('contracts')
        .select(`
          *,
          profile:profiles!inner(*)
        `)
        .eq('team', teamId)
        .eq('status', 'signed');

      if (membersError) throw membersError;

      return { team, members };
    },
  },

  {
    name: 'getLeaveBalance',
    description: 'Get leave balance for an employee',
    inputSchema: {
      type: 'object',
      properties: {
        contractId: {
          type: 'number',
          description: 'Contract ID',
        },
      },
      required: ['contractId'],
    },
    handler: async ({ contractId }) => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          paid_leave,
          paid_leave_used,
          sick_leave,
          sick_leave_used,
          maternity_leave,
          maternity_leave_used,
          paternity_leave,
          paternity_leave_used
        `)
        .eq('id', contractId)
        .single();

      if (error) throw error;

      return {
        paid_leave: {
          total: data.paid_leave || 0,
          used: data.paid_leave_used || 0,
          remaining: (data.paid_leave || 0) - (data.paid_leave_used || 0),
        },
        sick_leave: {
          total: data.sick_leave || 0,
          used: data.sick_leave_used || 0,
          remaining: (data.sick_leave || 0) - (data.sick_leave_used || 0),
        },
        maternity_leave: {
          total: data.maternity_leave || 0,
          used: data.maternity_leave_used || 0,
          remaining: (data.maternity_leave || 0) - (data.maternity_leave_used || 0),
        },
        paternity_leave: {
          total: data.paternity_leave || 0,
          used: data.paternity_leave_used || 0,
          remaining: (data.paternity_leave || 0) - (data.paternity_leave_used || 0),
        },
      };
    },
  },

  {
    name: 'getOpenRoles',
    description: 'Get list of open roles in the organization',
    inputSchema: {
      type: 'object',
      properties: {
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
        filters: {
          type: 'object',
          properties: {
            team: { type: 'number' },
            entity: { type: 'number' },
            employment_type: { type: 'string' },
          },
        },
      },
      required: ['org'],
    },
    handler: async ({ org, filters }) => {
      let queryBuilder = supabase
        .from('open_roles')
        .select(`
          *,
          team:teams(*),
          entity:legal_entities(*),
          applicants:job_applications(count)
        `)
        .eq('org', org)
        .eq('state', 'open');

      if (filters?.team) {
        queryBuilder = queryBuilder.eq('team', filters.team);
      }
      if (filters?.entity) {
        queryBuilder = queryBuilder.eq('entity', filters.entity);
      }
      if (filters?.employment_type) {
        queryBuilder = queryBuilder.eq('employment_type', filters.employment_type);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  },

  {
    name: 'getAppraisalInfo',
    description: 'Get appraisal information for an employee',
    inputSchema: {
      type: 'object',
      properties: {
        contractId: {
          type: 'number',
          description: 'Contract ID',
        },
      },
      required: ['contractId'],
    },
    handler: async ({ contractId }) => {
      const { data, error } = await supabase
        .from('appraisal_answers')
        .select(`
          *,
          appraisal_cycle:appraisal_cycles(*)
        `)
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  },

  {
    name: 'getOrganizationStats',
    description: 'Get organization statistics and dashboard data',
    inputSchema: {
      type: 'object',
      properties: {
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
      },
      required: ['org'],
    },
    handler: async ({ org }) => {
      // Get employee counts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('status', { count: 'exact' })
        .eq('org', org);

      if (contractsError) throw contractsError;

      // Get team counts
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id', { count: 'exact' })
        .eq('org', org);

      if (teamsError) throw teamsError;

      // Get open roles
      const { data: openRoles, error: rolesError } = await supabase
        .from('open_roles')
        .select('id', { count: 'exact' })
        .eq('org', org)
        .eq('state', 'open');

      if (rolesError) throw rolesError;

      // Get leave requests
      const { data: leaveRequests, error: leaveError } = await supabase
        .from('time_off')
        .select('status', { count: 'exact' })
        .eq('org', org)
        .eq('status', 'pending');

      if (leaveError) throw leaveError;

      const statusCounts = contracts?.reduce((acc: any, contract: any) => {
        acc[contract.status] = (acc[contract.status] || 0) + 1;
        return acc;
      }, {});

      return {
        total_employees: contracts?.length || 0,
        active_employees: statusCounts?.signed || 0,
        pending_contracts: statusCounts?.['awaiting signatures'] || 0,
        total_teams: teams?.length || 0,
        open_roles: openRoles?.length || 0,
        pending_leave_requests: leaveRequests?.length || 0,
      };
    },
  },

  {
    name: 'searchDocuments',
    description: 'Search for documents and templates',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
        filters: {
          type: 'object',
          properties: {
            template: { type: 'boolean' },
            owner: { type: 'string' },
            entity: { type: 'number' },
          },
        },
      },
      required: ['query', 'org'],
    },
    handler: async ({ query, org, filters }) => {
      let queryBuilder = supabase
        .from('documents')
        .select(`
          *,
          owner:profiles!owner(first_name, last_name, email)
        `)
        .eq('org', org)
        .ilike('name', `%${query}%`);

      if (filters?.template !== undefined) {
        queryBuilder = queryBuilder.eq('template', filters.template);
      }
      if (filters?.owner) {
        queryBuilder = queryBuilder.eq('owner', filters.owner);
      }
      if (filters?.entity) {
        queryBuilder = queryBuilder.eq('entity', filters.entity);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  },

  {
    name: 'getCalendarEvents',
    description: 'Get calendar events for the organization',
    inputSchema: {
      type: 'object',
      properties: {
        org: {
          type: 'string',
          description: 'Organization subdomain',
        },
        startDate: {
          type: 'string',
          description: 'Start date (ISO format)',
        },
        endDate: {
          type: 'string',
          description: 'End date (ISO format)',
        },
      },
      required: ['org'],
    },
    handler: async ({ org, startDate, endDate }) => {
      let queryBuilder = supabase
        .from('calendar_events')
        .select('*')
        .eq('org', org);

      if (startDate) {
        queryBuilder = queryBuilder.gte('start->dateTime', startDate);
      }
      if (endDate) {
        queryBuilder = queryBuilder.lte('end->dateTime', endDate);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  },

  {
    name: 'getEmployeeBenefits',
    description: 'Get employee benefits and compensation details',
    inputSchema: {
      type: 'object',
      properties: {
        contractId: {
          type: 'number',
          description: 'Contract ID',
        },
      },
      required: ['contractId'],
    },
    handler: async ({ contractId }) => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          salary,
          signing_bonus,
          fixed_allowance,
          additional_offerings,
          employment_type,
          work_location,
          work_schedule,
          level:employee_levels(*)
        `)
        .eq('id', contractId)
        .single();

      if (error) throw error;
      return data;
    },
  },
];

// Export all tools
export const getAllMCPTools = (): MCPTool[] => {
  return [...employeeTools];
};