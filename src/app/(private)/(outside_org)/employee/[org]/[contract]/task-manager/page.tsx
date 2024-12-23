import { createClient } from '@/utils/supabase/server';
import NumberFlow from '@number-flow/react';
import { IssuesBarChart } from './chart';
import { InLineChart } from './inline-chart';
import { Issue } from '@/app/(private)/[org]/performance/task-manager/issue';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const { data, error } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain)').eq('id', params.contract).single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	return (
		<section>
			<h2 className="mb-6 text-xl font-bold text-support">Issues</h2>

			<div>
				<h3 className="mb-6 text-sm font-medium text-support">Tasks by state</h3>

				<div className="mb-10 flex w-full flex-wrap gap-x-16 gap-y-10">
					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Total issues'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('20')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues done'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('13')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues ongoing'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('4')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues todo'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('4')} trend={0} />
						</p>
					</div>
				</div>

				<InLineChart />
			</div>

			<div className="mt-16">
				<h3 className="mb-6 text-sm font-medium text-support">Tasks by Priority</h3>

				<div className="mb-10 flex w-full flex-wrap gap-x-16 gap-y-10">
					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Total issues'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('20')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues done'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('13')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues ongoing'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('4')} trend={0} />
						</p>
					</div>

					<div className="grid gap-2">
						<h3 className="text-sm font-normal text-support">{'Issues todo'}</h3>
						<p className="text-4xl font-bold">
							<NumberFlow isolate value={Number('4')} trend={0} />
						</p>
					</div>
				</div>

				<InLineChart />
			</div>

			{/* <IssuesBarChart /> */}

			<div className="mt-16">
				<h3 className="mb-8 text-base font-normal text-support">Tasks</h3>

				{[1, 2, 3, 4, 5].map(issue => (
					<Issue key={issue} id="12" />
				))}
			</div>
		</section>
	);
}
