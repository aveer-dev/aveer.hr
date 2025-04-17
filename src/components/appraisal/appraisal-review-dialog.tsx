import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getTemplateQuestions } from '../appraisal-forms/appraisal.actions';

interface Props {
	org: string;
	contract: Tables<'contracts'>;
	appraisalCycle: Tables<'appraisal_cycles'>;
	answer?: Tables<'appraisal_answers'>;
}

export const AppraisalReviewDialog = async ({ org, contract, appraisalCycle, answer }: Props) => {
	const supabase = await createClient();

	if (!contract.team) {
		return null;
	}

	// Get manager's profile details
	const { data: manager } = await supabase.from('managers').select('profile:profiles(first_name, last_name)').eq('team', contract.team).single();

	if (!manager) {
		return null;
	}

	const questions = await getTemplateQuestions({ org, templateId: appraisalCycle.question_template });

	return (
		<AlertDialog>
			<Button variant="outline">View Review</Button>

			<AlertDialogContent className="max-w-3xl">
				<div className="space-y-6">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">{appraisalCycle.name}</h2>
						<p className="text-sm text-muted-foreground">
							Reviewed by {manager?.profile?.first_name} {manager?.profile?.last_name}
						</p>
					</div>

					<div className="space-y-8">
						{questions.map(question => {
							const employeeAnswer: any = (answer?.answers as any[])?.find((a: any) => a.question_id === question.id);
							const managerAnswer: any = (answer?.answers as any[])?.find((a: any) => a.question_id === question.id);

							return (
								<div key={question.id} className="space-y-4">
									<h3 className="text-base font-medium">{question.question}</h3>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<p className="text-sm font-medium">Your Answer</p>
											<div className="rounded-md border p-3">
												{Array.isArray(employeeAnswer?.answer) ? (
													<ul className="list-disc pl-4">
														{employeeAnswer.answer.map((item: string, index: number) => (
															<li key={index}>{item}</li>
														))}
													</ul>
												) : (
													<p>{employeeAnswer?.answer}</p>
												)}
											</div>
										</div>

										<div className="space-y-2">
											<p className="text-sm font-medium">Manager&apos;s Review</p>
											<div className="rounded-md border p-3">
												{Array.isArray(managerAnswer?.manager_answer) ? (
													<ul className="list-disc pl-4">
														{managerAnswer.manager_answer.map((item: string, index: number) => (
															<li key={index}>{item}</li>
														))}
													</ul>
												) : (
													<p>{managerAnswer?.manager_answer}</p>
												)}
												{managerAnswer?.manager_notes && (
													<>
														<Separator className="my-2" />
														<p className="text-sm text-muted-foreground">{managerAnswer.manager_notes}</p>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};
