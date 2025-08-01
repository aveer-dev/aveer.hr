import { Skeleton } from '@/components/ui/skeleton';

import { AppraisalQuestionsTemplates } from '@/components/appraisal-forms/appraisal-questions-templates';
import { Button } from '@/components/ui/button';
import { QuestionTemplateDialog } from '@/components/appraisal-forms/question-template-dialog';
import { AppraisalCycleDialog } from '@/components/appraisal-forms/appraisal-cycle-dialog';
import { AppraisalCyclesList } from '@/components/appraisal-forms/appraisal-cycles-list';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon } from 'lucide-react';
import { TeamRepository } from '@/dal/repositories/team.repository';
import { ContractRepository } from '@/dal/repositories/contract.repository';

export const AppraisalsPage = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const org = (await params)?.org;

	const teamRepo = new TeamRepository();
	const employeeRepo = new ContractRepository();
	const [{ data: teams, error: teamError }, { data: employees, error: employeeError }] = await Promise.all([teamRepo.getAllByOrg(org), employeeRepo.getAllByOrgWithProfile({ org, status: 'signed' })]);

	if (teamError || employeeError) {
		return <div>Error loading teams or employees</div>;
	}

	// const teams = teamsData.map(team => ({
	// 	...team,
	// 	employees: employees.filter(employee => employee.team_id === team.id)
	// }));

	return (
		<section>
			<div className="mb-6 flex items-center gap-4">
				<h1 className="text-xl font-bold">Appraisal</h1>
			</div>

			<Tabs defaultValue="templates" className="w-full">
				<div className="flex flex-col items-start justify-between gap-4 md:flex-row">
					<TabsList className="flex w-fit">
						<TabsTrigger value="templates">Question Templates</TabsTrigger>
						<TabsTrigger value="cycles">Appraisal Cycles</TabsTrigger>
					</TabsList>

					<div className="flex w-full gap-2 md:w-fit">
						<TabsContent value="cycles" className="m-0 w-full">
							<AppraisalCycleDialog org={org}>
								<Button className="w-full md:w-fit">
									<PlusIcon size={12} className="mr-2" />
									Add Appraisal Cycle
								</Button>
							</AppraisalCycleDialog>
						</TabsContent>

						<TabsContent value="templates" className="m-0 w-full">
							<QuestionTemplateDialog teams={teams || []} employees={employees || []} org={org}>
								<Button className="w-full md:w-fit">
									<PlusIcon size={12} className="mr-2" />
									Create Question Template
								</Button>
							</QuestionTemplateDialog>
						</TabsContent>
					</div>
				</div>

				<TabsContent value="cycles" className="mt-4">
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
				</TabsContent>

				<TabsContent value="templates" className="mt-4">
					<Suspense fallback={<Skeleton className="h-24 w-full" />}>
						<AppraisalQuestionsTemplates teams={teams || []} employees={employees || []} org={org} />
					</Suspense>
				</TabsContent>
			</Tabs>
		</section>
	);
};
