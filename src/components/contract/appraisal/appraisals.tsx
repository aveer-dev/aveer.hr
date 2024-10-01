import { createClient } from '@/utils/supabase/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FormSection, FormSectionDescription, InputsContainer } from '../../forms/form-section';
import { AppraisalForm } from './appraisal-form';

interface props {
	org: string;
	group: string;
}

export const Appraisals = async ({ org, group }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('appraisal_questions').select().match({ org, group });

	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>
					Appraisal 1<span className="ml-auto mr-3 text-xs text-muted-foreground">1 June, 2020</span>
				</AccordionTrigger>
				<AccordionContent>
					<FormSection>
						<FormSectionDescription>
							<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Default employee appraisal questions for all employees accross the organisation</p>
						</FormSectionDescription>

						<InputsContainer>{data && <AppraisalForm questions={data} />}</InputsContainer>
					</FormSection>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};
