import { createClient } from '@/utils/supabase/server';
import { AppraisalOverview } from './appraisal-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
// import { AppraisalSummary } from './appraisal-summary';
import { BackButton } from '@/components/ui/back-button';
import { AppraisalScoreSummary } from './appraisal-score-summary';
import { EmployeeAppraisalViewer } from './employee-appraisal-viewer';
import { Tables } from '@/type/database.types';

type ContractWithProfile = Tables<'contracts'> & {
	profile: Pick<Tables<'profiles'>, 'first_name' | 'last_name'>;
};

export const AppraisalDetails = async ({ org, id }: { org: string; id: string }) => {
	const supabase = await createClient();

	const [{ data: contracts, error: contractsError }, { data: appraisal, error: appraisalError }] = await Promise.all([
		supabase
			.from('contracts')
			.select(
				`
			*,
			profile:profiles!contracts_profile_fkey (
				first_name,
				last_name
			)
		    `
			)
			.match({ org, status: 'signed' })
			.returns<ContractWithProfile[]>(),
		supabase.from('appraisal_cycles').select('*').eq('id', parseInt(id)).single()
	]);

	if (contractsError) {
		return <div>Error loading employee data</div>;
	}

	if (appraisalError) {
		return <div>Error loading appraisal</div>;
	}

	const [{ data: answers, error: answersError }, { data: questions, error: questionsError }] = await Promise.all([
		supabase
			.from('appraisal_answers')
			.select('*')
			.eq('org', org)
			.in('contract_id', contracts?.map(c => c.id) || [])
			.eq('appraisal_cycle_id', parseInt(id)),
		supabase.from('template_questions').select('*').match({ org, template_id: appraisal.question_template })
	]);

	if (answersError) {
		return <div>Error loading appraisal answers</div>;
	}

	if (questionsError) {
		return <div>Error loading template questions</div>;
	}

	if (!contracts) {
		return <div>No contracts found</div>;
	}

	return (
		<div className="container mx-auto space-y-6 py-6">
			<div className="relative flex items-center justify-between">
				<BackButton className="mb-6" />

				<div>
					<h1 className="text-2xl font-bold">{appraisal.name}</h1>
					<p className="text-sm text-muted-foreground">{appraisal.description}</p>
				</div>

				<Badge variant="outline">
					{format(new Date(appraisal.start_date), 'MMM d, yyyy')} - {format(new Date(appraisal.end_date), 'MMM d, yyyy')}
				</Badge>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-fit grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="scores">Scores</TabsTrigger>
					<TabsTrigger value="details">Details</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<AppraisalOverview contracts={contracts as any} appraisal={appraisal as any} answers={answers as any} />
				</TabsContent>

				<TabsContent value="scores">
					<AppraisalScoreSummary contracts={contracts as any} answers={answers as any} />
				</TabsContent>

				<TabsContent value="details">
					<EmployeeAppraisalViewer employees={contracts as any} answers={answers as any} questions={questions as any} appraisalCycle={appraisal as any} />
				</TabsContent>

				{/* <TabsContent value="summary">
					<AppraisalSummary contracts={contracts} answers={answers} questions={questions} />
				</TabsContent> */}
			</Tabs>
		</div>
	);
};
