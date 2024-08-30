import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronRight, ChevronsUpDown, Info, Plus } from 'lucide-react';
import { DashboardCharts } from './chart.component';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NavLink } from '@/components/ui/link';
import { createClient } from '@/utils/supabase/server';
import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default async function OrgPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const { data, error, count } = await supabase.from('contracts').select('profile(first_name,last_name,nationality(name)), org, id, status, job_title, employment_type, start_date', { count: 'estimated' }).match({ org: props.params.org });

	if (data && !data.length) {
		const { data, error } = await supabase.from('legal_entities').select().match({ org: props.params.org });

		if (error) {
			return (
				<div className="flex h-[50vh] flex-col items-center justify-center text-center">
					<p className="text-xs">Unable to fetch legal entities, please refresh page to try again</p>
					<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
				</div>
			);
		}

		if (data && !data.length) {
			const options = [
				{ link: '/legal-entity/new', label: 'Add legal entity', description: 'This is the option for you if you have a registered legal entity, enabling you to perform subsequent actions with your company details.' },
				{ link: '/open-roles/new', label: 'Create a role for application', description: 'Get started quickly by opening job application for an open role. No entity yet, you can hire with Aveer as your Employer of Record.' },
				{ link: '/people/new', label: 'Add Employee', description: 'It&apos;s not a problem if you don&apos;t have a registered legal entity. You can hire with Aveer as your Employer of Record.' }
			];

			return (
				<div className="flex min-h-[50vh] flex-col items-center justify-center gap-10 text-center">
					<div className="grid gap-3">
						<p className="text-base font-bold">Welcome to aveer.hr</p>
						<p className="text-xs text-muted-foreground">How will you like to get started with your account?</p>
					</div>

					<div className="mx-auto grid items-center gap-6">
						{options.map((option, index) => (
							<NavLink href={option.link} key={index} org={props.params.org} className={cn(buttonVariants({ variant: 'outline' }), 'flex h-12 w-[350px] items-center gap-2 rounded-xl px-4 text-left text-xs')}>
								{option.label}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button className="text-muted-foreground">
												<Info size={12} />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-72 whitespace-break-spaces text-left">{option.description}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<ChevronRight size={12} className="ml-auto" />
							</NavLink>
						))}
					</div>
				</div>
			);
		}
	}

	if (error)
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch organisations available to you</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);

	return (
		<div className="mx-auto grid gap-20">
			<div className="flex justify-between">
				<Suspense
					fallback={
						<>
							<Skeleton className="h-32 w-full max-w-80" />
							<Skeleton className="h-32 w-full max-w-80" />
						</>
					}>
					<DashboardCharts contracts={count} org={props.params.org} />
				</Suspense>

				<div className="grid w-full max-w-80 gap-2 rounded-md border p-2">
					<div className="flex items-center justify-between">
						<h3 className="text-xs font-normal">Your tasks</h3>
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

					{/* <ul className="grid gap-2">
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Approve data update</li>
						<li className="rounded-full border border-input bg-input-bg p-2 text-xs font-light">Company information</li>
					</ul> */}
					<div className="flex h-20 items-center justify-center rounded-sm bg-accent text-xs text-muted-foreground">You don&apos;t have any pending task</div>
				</div>
			</div>

			<Suspense fallback={<Skeleton className="h-96 w-full max-w-[1200px]"></Skeleton>}>
				<ClientTable org={props.params.org} data={data as unknown as PERSON[]} />
			</Suspense>
		</div>
	);
}
