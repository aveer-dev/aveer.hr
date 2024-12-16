import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { AppraisalQuestions } from '@/components/appraisal-forms/appraisal-questions';
import { AppraisalSettingsForm } from './appraisal-settings-form';
import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';

interface props {
	org: string;
	teams: Tables<'teams'>[];
}

export const Appraisal = async ({ org, teams }: props) => {
	const supabase = await createClient();
	const { data, error } = await supabase.from('appraisal_settings').select().match({ org });

	return (
		<>
			<p className="my-5 text-xs text-destructive">{error?.message}</p>

			<FormSection>
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Appraisal settings</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Set how you&apos;ll like to handle appraisal accross the organisation</p>
				</FormSectionDescription>

				<InputsContainer>
					<AppraisalSettingsForm settings={data ? data[0] : undefined} org={org} />
				</InputsContainer>
			</FormSection>

			<AppraisalQuestions teams={teams} org={org}>
				<h2 className="mb-1 font-normal">Appraisal questions</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Default employee appraisal questions for all employees accross the organisation</p>
			</AppraisalQuestions>

			<AppraisalQuestions teams={teams} group="manager" org={org}>
				<h2 className="mb-1 font-normal">Managers: Appraisal questions</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Default managers - employees appraisal questions for managers to access employees</p>
			</AppraisalQuestions>
		</>
	);
};
