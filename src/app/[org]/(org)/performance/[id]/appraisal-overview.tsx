import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';

export const AppraisalOverview = async ({ contracts, org, id, appraisal, answers }: { contracts: Tables<'contracts'>[]; org: string; id: string; appraisal: Tables<'appraisal_cycles'>; answers: Tables<'appraisal_answers'>[] }) => {
	const supabase = await createClient();

	// Calculate progress for each employee
	const employeeProgress = contracts?.map(contract => {
		const employeeAnswer = answers?.find(a => a.contract_id === contract.id);
		const managerAnswer = answers?.find(a => a.manager_contract_id === contract.id);

		// If no answer exists, progress is 0
		const employeeProgress = employeeAnswer?.employee_submission_date ? 100 : 0;
		const managerProgress = managerAnswer?.manager_submission_date ? 100 : 0;

		return {
			contract,
			employeeProgress,
			managerProgress,
			employeeAnswer,
			managerAnswer,
			hasStarted: !!employeeAnswer || !!managerAnswer
		};
	});

	// Calculate overall progress
	const totalEmployees = employeeProgress?.length || 0;
	const completedEmployeeReviews = employeeProgress?.filter(p => p.employeeProgress === 100).length || 0;
	const completedManagerReviews = employeeProgress?.filter(p => p.managerProgress === 100).length || 0;

	const overallEmployeeProgress = totalEmployees > 0 ? (completedEmployeeReviews / totalEmployees) * 100 : 0;
	const overallManagerProgress = totalEmployees > 0 ? (completedManagerReviews / totalEmployees) * 100 : 0;

	return (
		<div className="">
			<Card className="bg-accent">
				<CardContent className="space-y-6 p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-medium text-muted-foreground">Self-Review Due Date</h3>
							<p className="text-sm">{format(new Date(appraisal.self_review_due_date), 'MMM d, yyyy')}</p>
						</div>
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-medium text-muted-foreground">Manager Review Due Date</h3>
							<p className="text-sm">{format(new Date(appraisal.manager_review_due_date), 'MMM d, yyyy')}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* <Alert variant="default" className="mt-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle className="text-sm">Appraisal Cycle is currently active</AlertTitle>
				<AlertDescription className="text-sm font-normal text-muted-foreground">You can still submit your self-review and manager review for this cycle.</AlertDescription>
			</Alert> */}

			<section className="mb-12 mt-12 space-y-8">
				<h2 className="text-sm text-muted-foreground">Overall Progress</h2>

				<div className="grid grid-cols-1 gap-16 md:grid-cols-2">
					<div>
						<div className="mb-2 flex justify-between">
							<span className="text-sm font-medium">Employee Reviews</span>
							<span className="text-sm text-muted-foreground">
								{completedEmployeeReviews} of {totalEmployees} completed
							</span>
						</div>
						<Progress value={overallEmployeeProgress} className="h-2" />
					</div>

					<div>
						<div className="mb-2 flex justify-between">
							<span className="text-sm font-medium">Manager Reviews</span>
							<span className="text-sm text-muted-foreground">
								{completedManagerReviews} of {totalEmployees} completed
							</span>
						</div>
						<Progress value={overallManagerProgress} className="h-2" />
					</div>
				</div>
			</section>

			<Separator />

			<section className="mb-12 mt-12 space-y-4">
				<h2 className="text-sm text-muted-foreground">Employee Progress</h2>

				<div className="space-y-6">
					{employeeProgress?.map(progress => (
						<Card key={progress.contract.id} className="flex items-center justify-between space-y-4 p-4">
							<div>
								<h3 className="text-sm font-medium">
									{(progress.contract.profile as any)?.first_name} {(progress.contract.profile as any)?.last_name}
								</h3>
								<p className="text-xs text-muted-foreground">{progress.contract.job_title}</p>
							</div>

							<div className="flex gap-8">
								<div className="space-y-2 text-right">
									<div className="text-xs font-medium">Self Review</div>
									<Progress value={progress.employeeProgress} className={`h-1 w-32 ${!progress.hasStarted ? 'opacity-80' : ''}`} />
									{!progress.hasStarted && <p className="mt-1 text-xs text-muted-foreground">Not started</p>}
								</div>

								<div className="space-y-2 text-right">
									<div className="text-xs font-medium">Manager Review</div>
									<Progress value={progress.managerProgress} className={`h-1 w-32 ${!progress.hasStarted ? 'opacity-80' : ''}`} />
									{!progress.hasStarted && <p className="mt-1 text-xs text-muted-foreground">Not started</p>}
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
};
