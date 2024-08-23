import { createClient } from '@/utils/supabase/server';
import { EmployeeBandDialog } from './employee-band-form';
import { doesUserHaveAdequatePermissions } from '@/utils/api';
import { TablesInsert, TablesUpdate } from '@/type/database.types';

interface props {
	org: string;
}

export const EmployeeBand = async ({ org }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('employee_levels').select().eq('org', org);

	if (error) {
		return (
			<div className="grid w-full gap-2 border-t border-t-border py-10 text-center text-xs text-muted-foreground">
				<p>Unable to fetch employee band data</p>
				<p>{error.message}</p>
			</div>
		);
	}

	const updateBand = async (band: TablesUpdate<'employee_levels'>) => {
		'use server';

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (typeof hasPermission == 'string') return hasPermission;

		if (!band.id) return 'Band ID not found. Unable to update band';

		const supabase = createClient();
		const { error } = await supabase
			.from('employee_levels')
			.update({ ...band, org })
			.eq('id', band.id);
		if (error) return error.message;
		return 'Update';
	};

	const createBand = async (band: TablesInsert<'employee_levels'>) => {
		'use server';

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (typeof hasPermission == 'string') return hasPermission;

		const supabase = createClient();
		const { error } = await supabase.from('employee_levels').insert({ ...band, org });
		if (error) return error.message;
		return true;
	};

	const deleteBand = async (bandId?: number) => {
		'use server';

		const hasPermission = await doesUserHaveAdequatePermissions({ orgId: org });
		if (typeof hasPermission == 'string') return hasPermission;

		if (!bandId) return 'Band ID not found. Unable to delete band';

		const supabase = createClient();
		const { error } = await supabase.from('employee_levels').delete().eq('id', bandId);
		if (error) return error.message;
		return true;
	};

	return (
		<div className="grid grid-cols-2 border-t border-t-border py-10">
			<div>
				<h2 className="mb-1 font-normal">Employee Bands</h2>
				<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">Creating employee bands makes it super easy to manage employees and their benefits. Set them once and connect them to employees once.</p>
			</div>

			<EmployeeBandDialog createBand={createBand} deleteBand={deleteBand} updateBand={updateBand} data={data} />
		</div>
	);
};
