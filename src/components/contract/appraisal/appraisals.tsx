import { createClient } from '@/utils/supabase/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { AppraisalForm } from './appraisal-form';
import { format, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface props {
	org: string;
	group: string;
	contract: number;
	full?: boolean;
	isOwner?: boolean;
}

export const Appraisals = async ({ org, group, contract, full = true, isOwner }: props) => {
	const supabase = createClient();

	const [appraisals, okrs] = await Promise.all([await supabase.from('appraisal_history').select().match({ org }), await supabase.from('okrs').select().match({ org })]);
	if (appraisals.error) return appraisals.error.message;

	if (appraisals.data.length == 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Keep it rolling, appraisal season is coming</p>
			</div>
		);
	}

	const [{ data }, answers] = await Promise.all([await supabase.from('appraisal_questions').select().match({ org, group }).order('order'), await supabase.from('appraisal_answers').select().match({ org, group, contract })]);

	const processOKRs = async () => {
		if (!okrs?.data) return false;

		const activeOkr = okrs?.data.find(okr => isWithinInterval(new Date(), { start: okr.start, end: okr.end }));
		if (!activeOkr) return false;

		const { data, error } = await supabase.from('okr_results').select(`*, okr_objective:okr_objectives!okr_results_okr_objective_fkey(id, objective)`).match({ org, okr: activeOkr.id });
		if (error) return error.message;

		const resultObjectivesIds = [...new Set(data.map(result => result.okr_objective.id))];
		const objectiveResult: { objective: string; results: string[]; id: number }[] = resultObjectivesIds.map(objectiveId => {
			const objectivesResults = data.filter(item => item.okr_objective.id == objectiveId);
			return { objective: objectivesResults[0].okr_objective.objective, id: objectivesResults[0].id, results: objectivesResults.map(result => result.result) };
		});

		return objectiveResult;
	};

	const OKRs = await processOKRs();

	return appraisals.data.map((appraisal, index) => (
		<Accordion key={appraisal.id} type="single" collapsible className="w-full space-y-8">
			<AccordionItem value={`appraisal-${index}`}>
				<AccordionTrigger>
					<div className={cn('flex items-center gap-3', !full && 'text-sm')}>
						Appraisal {index + 1}
						{!!answers.data && !!answers.data[0]?.submission_date && (
							<Badge className="text-[10px]" variant={'secondary-success'}>
								Submitted
							</Badge>
						)}
					</div>

					<span className="ml-auto mr-3 text-xs text-muted-foreground">
						{format(appraisal.created_at, 'MMM')} {format(appraisal.created_at, 'y')}
					</span>
				</AccordionTrigger>

				<AccordionContent>
					<FormSection className={cn('md:py-12', !full && 'md:grid-cols-1 md:py-8')}>
						{full && (
							<FormSectionDescription className="sticky top-10 max-w-xs">
								<h2 className="mb-5 text-base font-medium">Related OKR</h2>

								{typeof OKRs !== 'string' && typeof OKRs !== 'boolean' && (
									<ul className="space-y-8 overflow-y-auto text-muted-foreground">
										{OKRs.map(okr => (
											<li key={okr.id} className="space-y-2">
												<h4 className="text-xs">{okr.objective}</h4>

												<ul className="ml-4 list-disc space-y-2">
													{okr.results.map((result, idx) => (
														<li className="text-xs font-light leading-6" key={idx}>
															{result}
														</li>
													))}
												</ul>
											</li>
										))}
									</ul>
								)}

								{(typeof OKRs == 'string' || typeof OKRs == 'boolean') && <p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">{typeof OKRs == 'string' ? OKRs : 'None OKR set for this appraisal timeline'}</p>}
							</FormSectionDescription>
						)}

						<InputsContainer>{data && <AppraisalForm isOwner={isOwner} dbAnswer={answers.data ? answers.data[0] : undefined} appraisal={appraisal.id} appraisalStartDate={appraisal.start_date} contract={contract} org={org} questions={data} />}</InputsContainer>
					</FormSection>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	));
};
