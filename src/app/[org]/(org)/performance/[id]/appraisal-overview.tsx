import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/type/database.types';

export const AppraisalOverview = async ({ contracts, answers }: { contracts: Tables<'contracts'>[]; answers: Tables<'appraisal_answers'>[] }) => {
	// Calculate progress for each employee
	const employeeProgress = contracts?.map(contract => {
		const employeeAnswer = answers?.find(a => a.contract_id === contract.id);

		// If no answer exists, progress is 0
		const employeeProgress = employeeAnswer?.employee_submission_date ? 100 : 0;
		const managerProgress = employeeAnswer?.manager_submission_date ? 100 : 0;

		return {
			contract,
			employeeProgress,
			managerProgress,
			employeeAnswer,
			hasStarted: !!employeeAnswer
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
