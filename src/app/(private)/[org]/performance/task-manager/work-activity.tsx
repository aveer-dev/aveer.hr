import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriorityIcon } from './priority-icon';
import Link from 'next/link';
import { getAllIssues, getCycleIssues, getCycles, getProject, getStates } from './plane.actions';
import { WorkActivityCharts } from './work-activity-chart';
import { isWithinInterval } from 'date-fns';
import { PLANE_ASSIGNEE, PLANE_CYCLE, PLANE_ISSUE, PLANE_STATE } from './plane.types';
import { IssueStateIcon } from './issue-state-icon';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { PlaneSetupSheet } from './plane-setup-sheet';
import { TablesUpdate } from '@/type/database.types';

export const WorkActivity = async ({ paramCycleId, org }: { paramCycleId?: string; org: string }) => {
	const supabase = await createClient();

	const { data: settings, error: settingsError } = await supabase.from('org_settings').select('enable_task_manager, plane_project, plane_key, plane_workspace_slug').match({ org }).single();

	if (settingsError) {
		return (
			<div className="flex min-h-48 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Error loading this section, please refresh and try again</p>
			</div>
		);
	}

	const savePlaneConfig = async (payload: { plane_workspace_slug: string; plane_key: string; plane_project: string }) => {
		'use server';
		const supabase = await createClient();

		const signinData: TablesUpdate<'org_settings'> = {
			...payload,
			enable_task_manager: true
		};

		const { error } = await supabase.from('org_settings').update(signinData).match({ org });

		if (error) return error.message;
		return true;
	};

	if (!settings?.enable_task_manager) {
		return (
			<section>
				<h1 className="text-xl font-bold">Employee Performance</h1>

				<div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-md bg-accent text-center text-xs leading-6 text-muted-foreground">
					<p>
						You connect Plane.so directly to aveer.hr and start <br /> monitoring employee performance in one place in realtime.{' '}
					</p>

					<PlaneSetupSheet updateOrg={savePlaneConfig} />
				</div>
			</section>
		);
	}

	const projectId = settings?.plane_project as string;
	const apiKey = settings?.plane_key as string;
	const workspaceSlug = settings?.plane_workspace_slug as string;

	const { results: cycles, detail } = await getCycles({ workspaceSlug, apiKey, projectId });

	const activeCycle = paramCycleId ? (cycles as PLANE_CYCLE[]).find(cycle => cycle.id === paramCycleId) : (cycles as PLANE_CYCLE[]).find(cycle => isWithinInterval(new Date(), { start: new Date(cycle.start_date), end: new Date(cycle.end_date) }));

	if (!activeCycle) return;

	const [{ results: activeCycleIssues }, { results: allIssues }, { results: issueStates, detail: issueStateDetail, error: issueStateError }, project] = await Promise.all([
		getCycleIssues({ cycleId: activeCycle.id, projectId, apiKey, workspaceSlug }),
		getAllIssues({ projectId, apiKey, workspaceSlug }),
		getStates({ projectId, apiKey, workspaceSlug }),
		getProject({ projectId, apiKey, workspaceSlug })
	]);

	const issues = (allIssues as PLANE_ISSUE[]).filter(issue => (activeCycleIssues as PLANE_ISSUE[]).find(activeIssue => activeIssue.id === issue.id)).sort((a, b) => a.sequence_id - b.sequence_id);
	const assignees = issues
		.filter(issue => issue.assignees.length > 0)
		.flatMap(issue => issue.assignees)
		.reduce((acc: PLANE_ASSIGNEE[], current: any) => {
			if (!acc.find(item => item.id === current.id)) {
				acc.push(current);
			}

			return acc;
		}, []);

	return (
		<section>
			<h1 className="text-xl font-bold">Employee Performance</h1>

			<WorkActivityCharts activeCycle={activeCycle} issues={issues as PLANE_ISSUE[]} states={issueStates as PLANE_STATE[]} cycles={cycles} />

			<div className="mt-20">
				<h2 className="text-xl font-medium">Issues</h2>

				<Tabs defaultValue="priority" className="w-full">
					<div className="mt-4 flex items-center gap-4">
						<h3 className="w-fit text-sm">Filter by</h3>

						<TabsList className="flex w-fit items-center">
							<TabsTrigger value="priority">Priority</TabsTrigger>
							<TabsTrigger value="people">People</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="priority">
						<ul className="mt-6 space-y-3">
							{(issues as PLANE_ISSUE[]).map(issue => (
								<Issue key={issue.id} issue={issue} id={project?.identifier + '-' + issue.sequence_id} />
							))}
						</ul>
					</TabsContent>

					<TabsContent value="people">
						<ul className="mt-6 space-y-3">
							{assignees.map(assignee => (
								<Person
									key={assignee.id}
									assignee={assignee}
									personIssuesDone={issues.filter(issue => issue.assignees.find((person: any) => person.id === assignee.id && issue.state.name === 'Done')).length}
									personIssues={issues.filter(issue => issue.assignees.find((person: any) => person.id === assignee.id)).length}
								/>
							))}
						</ul>
					</TabsContent>
				</Tabs>
			</div>
		</section>
	);
};

const Issue = ({ issue, id }: { issue: PLANE_ISSUE; id?: string }) => {
	return (
		<Link href={'#'} legacyBehavior passHref>
			<li className="flex cursor-pointer items-center rounded-md py-2 transition-all duration-500 hover:bg-accent hover:px-2">
				<PriorityIcon state={issue.priority as any} />
				<p className="ml-2 text-sm">
					<span className="pr-2 font-light text-support">{id}</span>
					{issue.name}
				</p>

				<div className="ml-auto flex w-fit items-center gap-2 rounded-md border px-2 py-1 text-sm font-light">
					<IssueStateIcon state={issue.state.name} size={12} />
					{issue.state.name}
				</div>
			</li>
		</Link>
	);
};

const Person = ({ assignee, personIssuesDone, personIssues }: { assignee: PLANE_ASSIGNEE; personIssuesDone: number; personIssues: number }) => {
	return (
		<Link href={'#'} legacyBehavior passHref>
			<li className="flex cursor-pointer items-center rounded-md py-2 transition-all duration-500 hover:bg-accent hover:px-2">
				<div className="flex h-7 w-7 items-center justify-center rounded-full border text-xs">{assignee.first_name[0].toUpperCase()}</div>
				<div className="ml-3">
					<p className="w-fit text-sm">
						{assignee.first_name} {assignee.last_name}
					</p>
					<p className="w-fit text-xs font-light text-support">{assignee.email}</p>
				</div>

				<div className="ml-auto flex w-fit items-center gap-2 text-sm font-light text-support">
					{personIssues} issues <span className="text-[4px]">⬤</span> {(personIssuesDone / personIssues) * 100}% done
				</div>
			</li>
		</Link>
	);
};
