import { AppraisalRepository, ContractRepository, ManagerRepository, QuestionTemplateRepository, TeamRepository } from '@/dal';
import { AppraisalFormComponent } from './appraisal-form-component';

export default async function AppraisalPageComponent({ params }: { params: Promise<{ [key: string]: string }> }) {
	const { id, org, contract } = await params;

	const appraisalRepo = new AppraisalRepository();
	const contractRepo = new ContractRepository();
	const [{ data: appraisalCycle, error: appraisalCycleError }, { data: contractData, error: contractError }] = await Promise.all([appraisalRepo.getCycleById(Number(id)), contractRepo.getByIdWithProfile(org, Number(contract))]);

	if (contractError || !contractData) {
		return <div className="flex h-56 w-full items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">Error: {contractError?.message}</div>;
	}

	if (appraisalCycleError || !appraisalCycle) {
		return <div className="flex h-56 w-full items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">Error: {appraisalCycleError?.message}</div>;
	}

	const teamRepo = new TeamRepository();
	const managerRepo = new ManagerRepository();
	const questionRepo = new QuestionTemplateRepository();
	const [teamMembers, manager, appraisalAnswers, teams, questions, template] = await Promise.all([
		contractRepo.getByTeamStatusOrgWithProfile({ team: contractData?.team || undefined, status: 'signed', org, contractId: contractData.id }),
		managerRepo.getByContract({ contractId: Number(contract) }),
		appraisalRepo.getAllAnswersForCycle(Number(id)),
		teamRepo.getAllByOrg(org),
		appraisalRepo.getQuestionsByTemplate(appraisalCycle.question_template),
		questionRepo.getById(appraisalCycle.question_template)
	]);

	if (manager.error) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch manager</p>
				<p>Error: {manager.error?.message}</p>
			</div>
		);
	}

	if (teamMembers.error) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch team members</p>
				<p>Error: {teamMembers.error?.message}</p>
			</div>
		);
	}

	if (appraisalAnswers.error) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch appraisal answers</p>
				<p>Error: {appraisalAnswers.error?.message}</p>
			</div>
		);
	}

	if (teams.error) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch teams</p>
				<p>Error: {teams.error?.message}</p>
			</div>
		);
	}

	if (questions.error || !questions.data) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch questions</p>
				<p>Error: {questions.error?.message}</p>
			</div>
		);
	}

	if (template.error || !template.data) {
		return (
			<div className="flex h-56 w-full flex-col items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Unable to fetch template</p>
				<p>Error: {template.error?.message}</p>
			</div>
		);
	}

	const teamMembersAnswers = appraisalAnswers.data?.filter(answer => teamMembers.data?.some(member => member.id === answer.contract_id));

	return (
		<AppraisalFormComponent
			org={org}
			questions={questions.data}
			template={template.data}
			teams={teams.data || []}
			teamMembers={teamMembers.data || []}
			manager={manager?.data || null}
			teamMembersAnswers={teamMembersAnswers || []}
			contract={contractData}
			appraisalCycle={appraisalCycle}
		/>
	);
}
