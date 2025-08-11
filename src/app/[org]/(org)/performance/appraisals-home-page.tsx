import { AppraisalRepository, ContractRepository, TeamRepository } from '@/dal';
import { AppraisalsHome } from './appraisals-home';

export const AppraisalsHomePage = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const org = (await params)?.org;
	const teamRepo = new TeamRepository();
	const employeeRepo = new ContractRepository();
	const appraisalRepo = new AppraisalRepository();
	const [{ data: teams, error: teamError }, { data: employees, error: employeeError }, { data: answers, error: answersError }, { data: cycles, error: cyclesError }, { data: questions, error: questionsError }] = await Promise.all([
		teamRepo.getAllByOrg(org),
		employeeRepo.getAllByOrgWithProfile({ org, status: 'signed' }),
		appraisalRepo.getAllOrgAnswers(org),
		appraisalRepo.getAllCycles(org),
		appraisalRepo.getAllQuestions(org)
	]);

	if (teamError || employeeError || answersError || cyclesError || questionsError) {
		return <div>Error loading teams or employees</div>;
	}
	return (
		<div className="space-y-8">
			<AppraisalsHome org={org} employees={employees} answers={answers ?? []} cycles={cycles ?? []} teams={teams ?? []} questions={questions ?? []} />
		</div>
	);
};
