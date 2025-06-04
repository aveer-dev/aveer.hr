import { createClient } from '@/utils/supabase/server';
import { EmployeeBandDialog } from './employee-band-form';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { Card } from '@/components/ui/card';

interface props {
	org: string;
}

export const EmployeeBand = async ({ org }: props) => {
	const supabase = await createClient();

	const [{ data, error }, { data: entities }] = await Promise.all([supabase.from('employee_levels').select().eq('org', org), supabase.from('legal_entities').select('*, incorporation_country(currency_code, country_code, id)').eq('org', org)]);

	if (error) {
		return (
			<div className="grid w-full gap-2 border-t border-t-border py-10 text-center text-xs text-muted-foreground">
				<p>Unable to fetch employee band data</p>
				<p>{error.message}</p>
			</div>
		);
	}

	return (
		<FormSection id="levels">
			<FormSectionDescription>
				<h2 className="mb-1 font-normal">Employee Levels</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Creating employee levels makes it super easy to manage employees and their benefits. Set them once and connect them to employees once.</p>
			</FormSectionDescription>

			<InputsContainer>
				{data.map(band => (
					<EmployeeBandDialog band={band} key={band.id} org={org} entities={entities} />
				))}

				{data.length == 0 && <Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">You do not have any employee levels yet</Card>}

				<EmployeeBandDialog org={org} entities={entities} />
			</InputsContainer>
		</FormSection>
	);
};
