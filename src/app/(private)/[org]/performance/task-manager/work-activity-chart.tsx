import { CyclesPopover } from './cycles-popover';
import { PLANE_CYCLE, PLANE_ISSUE, PLANE_STATE } from './plane.types';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays } from 'date-fns';
import { IssueStateIcon } from './issue-state-icon';

export const WorkActivityCharts = ({ activeCycle, cycles, issues, states }: { activeCycle?: PLANE_CYCLE; issues: PLANE_ISSUE[]; states: PLANE_STATE[]; cycles: PLANE_CYCLE[] }) => {
	const filterIssuesByState = (issues: PLANE_ISSUE[], states: PLANE_STATE[]) => {
		return states.map(state => ({
			state: state.name,
			issues: issues.filter(issue => issue.state.id === state.id).length,
			expected: issues.length / (differenceInCalendarDays(new Date(activeCycle?.end_date ?? ''), new Date(activeCycle?.start_date ?? '')) + 1)
		}));
	};

	const groupedIssues = filterIssuesByState(issues, states);

	const noDoneIsues = Number(groupedIssues.find(state => state.state === 'Done')?.issues);
	const noPendingIsues = Number(groupedIssues.find(state => state.state === 'In Progress')?.issues);
	const noIssues = issues.length;

	const percentageIssueDone = (noDoneIsues / noIssues) * 100;
	const percentageIssuePending = (noPendingIsues / noIssues) * 100;

	return (
		<>
			<div className="mb-6 mt-6 flex items-center gap-3">
				<CyclesPopover activeCycle={activeCycle} cycles={cycles} />
			</div>

			<div className="mt-16 flex gap-20">
				<div className="w-full">
					<div className="relative h-1 w-full rounded-md bg-accent">
						<div className="absolute bottom-0 left-0 top-0 z-10 rounded-md bg-foreground transition-all" style={{ width: percentageIssueDone + '%' }}>
							{percentageIssueDone > 0 && <div className="absolute -right-px bottom-0 h-8 border-r pr-2 text-xs text-muted-foreground">{percentageIssueDone}%</div>}
						</div>

						<div className="absolute bottom-0 left-0 top-0 rounded-md bg-orange-300 transition-all" style={{ width: percentageIssueDone + percentageIssuePending + '%' }}>
							{10 > 0 && <div className={cn('absolute -right-px bottom-0 border-r pr-2 text-xs text-muted-foreground', 50 > 0 ? 'h-16' : 'h-12')}>{percentageIssuePending}%</div>}
						</div>
					</div>

					<div className="mt-2 flex items-center justify-between">
						<h3 className="mt-2 text-xs font-normal">
							<span className="capitalize">Issues</span>
						</h3>
						<div className="space-y-1 text-xs text-muted-foreground">
							<p>Total: {noIssues}</p>
						</div>
					</div>

					<ul className="mt-8 space-y-1">
						{groupedIssues.map(state => (
							<li key={state.state + state.issues} className="flex items-center justify-between rounded-md border-b border-border/20 py-3 text-sm font-light transition-all duration-500 hover:bg-accent/50 hover:pl-2 hover:pr-4">
								<div className="flex items-center gap-2">
									<IssueStateIcon state={state.state} />
									{state.state}
								</div>
								<div className="font-light text-support">{state.issues}</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
};
