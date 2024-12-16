import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { AppraisalQuestionsForm } from './appraisal-questions-form';
import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';

interface props {
	org: string;
	children: ReactNode;
	group?: string;
	teams: Tables<'teams'>[];
}

export const AppraisalQuestions = async ({ org, children, group = 'employee', teams }: props) => {
	const supabase = await createClient();

	const { data } = await supabase.from('appraisal_questions').select().match({ org, group });

	// const questions: { type: FORM_INPUT_TYPE; question: string; options: string[]; required?: boolean }[] = [];

	return (
		<FormSection>
			<FormSectionDescription>{children}</FormSectionDescription>

			<InputsContainer>
				<AppraisalQuestionsForm teams={teams} questionsData={data ? data[0] : undefined} org={org} group={group} isOptional={group !== 'employee'} />
			</InputsContainer>
		</FormSection>
	);
};
