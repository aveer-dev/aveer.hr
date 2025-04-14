import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { AppraisalQuestions } from '@/components/appraisal-forms/appraisal-questions';
import { Tables } from '@/type/database.types';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppraisalCyclesList } from './appraisal-cycles-list';
import { QuestionTemplateDialog } from './question-template-dialog';
import { AppraisalQuestionsTemplates } from './appraisal-questions-templates';

interface props {
	org: string;
	teams: Tables<'teams'>[];
}

export const Appraisal = ({ org, teams }: props) => {
	return (
		<>
			<FormSection>
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Appraisal cycles</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">List of all the appraisal cycles for the organisation</p>
				</FormSectionDescription>

				<InputsContainer>
					<Suspense
						fallback={
							<div className="space-y-4">
								<Skeleton className="h-24 w-full" />
								<Skeleton className="h-24 w-full" />
								<Skeleton className="h-24 w-full" />
							</div>
						}>
						<AppraisalCyclesList org={org} />
					</Suspense>

					<AppraisalCycleDialog org={org}>
						<Button className="w-full">Add Appraisal Cycle</Button>
					</AppraisalCycleDialog>
				</InputsContainer>
			</FormSection>

			<FormSection>
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Appraisal questions templates</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Create and manage question templates for appraisal cycles</p>
				</FormSectionDescription>

				<InputsContainer>
					<Suspense fallback={<Skeleton className="h-24 w-full" />}>
						<AppraisalQuestionsTemplates teams={teams} org={org} />
					</Suspense>

					<QuestionTemplateDialog teams={teams} org={org}>
						<Button className="w-full">Create Question Template</Button>
					</QuestionTemplateDialog>
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
