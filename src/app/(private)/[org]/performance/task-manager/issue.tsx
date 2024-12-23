import Link from 'next/link';
import { IssueStateIcon } from './issue-state-icon';
import { PLANE_ISSUE } from './plane.types';
import { PriorityIcon } from './priority-icon';

export const Issue = ({ issue, id }: { issue?: PLANE_ISSUE; id?: string }) => {
	return issue ? (
		<Link href={'#'} legacyBehavior passHref>
			<li className="flex cursor-pointer items-center rounded-md py-2 transition-all duration-500 hover:bg-accent hover:px-2">
				<PriorityIcon state={issue.priority as any} />
				<p className="ml-2 text-xs">
					<span className="pr-2 font-light text-support">{id}</span>
					{issue.name}
				</p>

				<div className="ml-auto flex w-fit items-center gap-2 rounded-md border px-2 py-1 text-sm font-light">
					<IssueStateIcon state={issue.state.name} size={12} />
					{issue.state.name}
				</div>
			</li>
		</Link>
	) : null;
};
