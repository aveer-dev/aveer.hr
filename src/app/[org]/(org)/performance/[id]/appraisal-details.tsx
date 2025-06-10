import { createClient } from '@/utils/supabase/server';
import { AppraisalOverview } from './appraisal-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BackButton } from '@/components/ui/back-button';
import { AppraisalScoreSummary } from './appraisal-score-summary';
import { EmployeeAppraisalViewer } from './employee-appraisal-viewer';
import { ContractRepository, TeamRepository } from '@/dal';
import { getQuestionTemplate } from '@/components/appraisal-forms/appraisal.actions';
import { AppraisalCycleDialog } from '@/components/appraisal-forms/appraisal-cycle-dialog';
import { Button } from '@/components/ui/button';
import { ListCollapse } from 'lucide-react';
import { EmployeeObjectivesList } from './employee-objectives-list';
import { AppraisalQuestionsStats } from './appraisal-questions-stats';

export const AppraisalDetails = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { org, id } = await params;

	const supabase = await createClient();

	const contractsRepo = new ContractRepository();
	const [{ data: contracts, error: contractsError }, { data: appraisal, error: appraisalError }] = await Promise.all([contractsRepo.getAllByOrgWithProfile({ org, status: 'signed' }), supabase.from('appraisal_cycles').select('*').eq('id', parseInt(id)).single()]);

	if (contractsError) {
		return <div>Error loading employee data</div>;
	}

	if (appraisalError) {
		return <div>Error loading appraisal</div>;
	}

	const teamsRepo = new TeamRepository();
	const [{ data: answers, error: answersError }, { data: questions, error: questionsError }, teams, template] = await Promise.all([
		supabase
			.from('appraisal_answers')
			.select('*')
			.eq('org', org)
			.in('contract_id', contracts?.map(c => c.id) || [])
			.eq('appraisal_cycle_id', parseInt(id)),
		supabase.from('template_questions').select('*').match({ org, template_id: appraisal.question_template }),
		teamsRepo.getAllByOrg(org),
		getQuestionTemplate(appraisal.question_template)
	]);

	if (answersError) {
		return <div>Error loading appraisal answers</div>;
	}

	if (questionsError) {
		return <div>Error loading template questions</div>;
	}

	if (contractsError) {
		return <div>No contracts found</div>;
	}

	if (teams.error) {
		return <div>No teams found</div>;
	}

	// Collect all unique team_ids from questions
	const teamIdSet = new Set<number>();
	(questions || []).forEach(q => {
		if (Array.isArray(q.team_ids)) {
			q.team_ids.forEach((id: number) => teamIdSet.add(id));
		}
	});
	const teamIds = Array.from(teamIdSet);

	// Fetch team details for these ids
	let teamsForQuestions: any[] = [];
	if (teamIds.length > 0) {
		const { data: teamsData } = await supabase.from('teams').select('*').in('id', teamIds);
		teamsForQuestions = teamsData || [];
	}

	return (
		<div className="mx-auto space-y-6 py-6">
			<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<BackButton className="mb-6" />

					<div>
						<h1 className="text-2xl font-bold">{appraisal.name}</h1>
						<p className="text-sm text-muted-foreground">{appraisal.description}</p>
					</div>
				</div>

				<Badge variant="outline" className="w-fit">
					{format(new Date(appraisal.start_date), 'MMM d, yyyy')} - {format(new Date(appraisal.end_date), 'MMM d, yyyy')}
				</Badge>
			</div>

			{answers.length === 0 && <div className="flex min-h-72 w-full items-center justify-center rounded-md border bg-muted p-4 text-sm text-muted-foreground">No answers yet for this appraisal cycle.</div>}

			{answers.length > 0 && (
				<Tabs defaultValue="overview" className="w-full">
					<div className="flex items-center justify-between gap-4">
						<TabsList className="flex w-fit px-2">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="scores">Scores</TabsTrigger>
							<TabsTrigger value="objectives">Objectives & Goals</TabsTrigger>
							<TabsTrigger value="questions">Questions Summary</TabsTrigger>
							<TabsTrigger value="details">Deep Dive</TabsTrigger>
						</TabsList>

						<AppraisalCycleDialog org={org} cycle={appraisal}>
							<Button variant="outline" size="icon">
								<ListCollapse size={14} />
							</Button>
						</AppraisalCycleDialog>
					</div>

					<TabsContent value="overview">
						<AppraisalOverview contracts={contracts as any} answers={answers as any} />
					</TabsContent>

					<TabsContent value="scores">
						<AppraisalScoreSummary teams={teams.data || []} contracts={contracts as any} answers={answers as any} />
					</TabsContent>

					<TabsContent value="details">
						<EmployeeAppraisalViewer employees={contracts as any} answers={answers as any} questions={questions as any} appraisalCycle={appraisal as any} customGroupNames={(template.custom_group_names as { id: string; name: string }[]) || []} />
					</TabsContent>

					<TabsContent value="objectives">
						<EmployeeObjectivesList employees={contracts as any} answers={answers as any} />
					</TabsContent>

					<TabsContent value="questions">
						<AppraisalQuestionsStats questions={questions as any} answers={answers as any} employees={contracts as any} teamsForQuestions={teamsForQuestions} />
					</TabsContent>

					{/* <TabsContent value="summary">
					<AppraisalSummary contracts={contracts} answers={answers} questions={questions} />
					</TabsContent> */}
				</Tabs>
			)}
		</div>
	);
};
