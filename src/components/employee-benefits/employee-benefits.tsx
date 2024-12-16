import { createClient } from '@/utils/supabase/server';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { TablesUpdate } from '@/type/database.types';
import { EmployeeBenefitsForm } from './employee-benefits-form';
import { FormSection, FormSectionDescription, InputsContainer } from '../forms/form-section';

interface props {
	org: string;
}

export const EmployeeBenefits = async ({ org }: props) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('org_settings').select().eq('org', org).single();

	const updateBenefits = async (benefits: TablesUpdate<'org_settings'>) => {
		'use server';

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (typeof hasPermission == 'string') return hasPermission;

		const supabase = await createClient();
		const { error } = await supabase.from('org_settings').upsert({ ...benefits, org }, { onConflict: 'org' });
		if (error) return error.message;
		return true;
	};

	return (
		<FormSection id="employee-policies">
			<FormSectionDescription>
				<h2 className="mb-1 font-normal">Employee Policies</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are generic policies, schedule and benefits available company wide. They get automatically populated when filling employee contract forms.</p>
			</FormSectionDescription>

			<InputsContainer>
				<EmployeeBenefitsForm updateBenefits={updateBenefits} data={data} />
			</InputsContainer>
		</FormSection>
	);
};
