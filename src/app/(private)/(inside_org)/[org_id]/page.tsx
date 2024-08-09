import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { DashboardCharts } from './chart';
import { PeopleTable } from './people-table';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrgPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<div className="mx-auto grid gap-20">
			<div className="flex justify-between">
				<Suspense fallback={<Skeleton className="h-32 w-full max-w-[1200px]"></Skeleton>}>
					<DashboardCharts orgId={props.params.org_id} />
				</Suspense>

				<div className="grid w-full max-w-80 gap-2">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-normal">Your tasks</h3>
						<div className="flex items-center gap-1">
							<Button size={'icon'} variant={'ghost'} className="h-8 w-8">
								<ChevronsUpDown size={16} />
							</Button>

							<div className="h-3 w-px bg-muted-foreground"></div>

							<Button size={'icon'} variant={'ghost'} className="h-8 w-8">
								<Plus size={16} />
							</Button>
						</div>
					</div>

					<ul className="grid gap-2">
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Approve data update</li>
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Company information</li>
					</ul>
				</div>
			</div>

			<Suspense fallback={<Skeleton className="h-96 w-full max-w-[1200px]"></Skeleton>}>
				<PeopleTable orgId={props.params.org_id} />
			</Suspense>
		</div>
	);
}
