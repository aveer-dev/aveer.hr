import { createClient } from '@/utils/supabase/server';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { TablesUpdate } from '@/type/database.types';
import { EmployeeBenefitsForm } from './employee-benefits-form';

interface props {
	org: string;
}

export const EmployeeBenefits = async ({ org }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('org_settings').select().eq('org', org).single();

	const updateBenefits = async (benefits: TablesUpdate<'org_settings'>) => {
		'use server';

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (typeof hasPermission == 'string') return hasPermission;

		const supabase = createClient();
		const { error } = await supabase.from('org_settings').upsert({ ...benefits, org }, { onConflict: 'org' });
		if (error) return error.message;
		return true;
	};

	return (
		<div id="employee-policies" className="grid w-full gap-6">
			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="mb-1 font-normal">Employee Policies</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These are generic policies, schedule and benefits available company wide. They get automatically populated when filling employee contract forms.</p>
				</div>

				<EmployeeBenefitsForm updateBenefits={updateBenefits} data={data} />
			</div>
		</div>
	);
};
