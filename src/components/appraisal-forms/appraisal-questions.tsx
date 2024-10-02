import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { AppraisalQuestionsForm } from './appraisal-questions-form';
import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import { FORM_INPUT_TYPE } from '@/type/performance.types';

interface props {
	org: string;
	children: ReactNode;
	group?: string;
}

export const AppraisalQuestions = async ({ org, children, group = 'employee' }: props) => {
	const supabase = createClient();

	const { data } = await supabase.from('appraisal_questions').select().match({ org, group }).order('order');

	// const questions: { type: FORM_INPUT_TYPE; question: string; options: string[]; required?: boolean }[] = [];

	return (
		<FormSection>
			<FormSectionDescription>{children}</FormSectionDescription>

			<InputsContainer>
				<AppraisalQuestionsForm questionsData={{ q: data as any }} org={org} group={group} isOptional={group !== 'employee'} />
			</InputsContainer>
		</FormSection>
	);
};
