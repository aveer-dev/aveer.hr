import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { DashboardCharts } from './chart.component';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PERSON } from '@/type/person';
import { ClientTable } from './table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default async function OrgPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const { data, error } = await supabase.from('contracts').select('profile(first_name,last_name,nationality(name)), org, id, status, job_title, employment_type, start_date').match({ org: props.params.org_id });

	if (data && !data.length) {
		const { data, error } = await supabase.from('legal_entities').select().match({ org: props.params.org_id });

		if (error) {
			return (
				<div className="flex h-[50vh] flex-col items-center justify-center text-center">
					<p className="text-xs">Unable to fetch legal entities, please refresh page to try again</p>
					<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
				</div>
			);
		}

		if (data && !data.length) {
			return (
				<div className="flex min-h-[50vh] flex-col items-center justify-center gap-10 text-center">
					<div className="grid gap-3">
						<p className="text-base font-bold">Welcome to aveer.hr</p>
						<p className="text-xs text-muted-foreground">How will you like to get started with your account?</p>
					</div>

					<Card className="w-[350px] text-left">
						<CardHeader>
							<CardTitle className="text-sm font-semibold">Setup Legal Entity</CardTitle>
							<CardDescription className="text-xs font-light leading-5 text-muted-foreground">This is the option for you if you have a registered legal entity, enabling you to perform subsequent actions with your company details.</CardDescription>
						</CardHeader>
						<CardContent>
							<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={`${props.params.org_id}/legal-entity/new`}>
								Add legal entity
							</Link>
						</CardContent>
					</Card>

					<div className="mt-10 border-t border-t-secondary pt-4">
						<div className="mx-auto -mt-6 w-fit bg-background px-6 text-xs">Or</div>

						<p className="mt-14 text-xs font-light text-muted-foreground">Get straight into hiring and managing employees, while we sort out the other legalities for you.</p>
					</div>

					<div className="mx-auto flex items-center gap-8">
						<Card className="w-[350px] text-left">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Hire a contractor</CardTitle>
								<CardDescription className="text-xs font-light leading-5 text-muted-foreground">This is the option for you if you have a registered legal entity, enabling you to perform subsequent actions as a legal company.</CardDescription>
							</CardHeader>
							<CardContent>
								<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={`${props.params.org_id}/people/new?type=contractor`}>
									Add Contractor
								</Link>
							</CardContent>
						</Card>

						<Card className="w-[350px] text-left">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Hire an employee</CardTitle>
								<CardDescription className="text-xs font-light leading-5 text-muted-foreground">
									This is the option for you if you don&apos;t have a registered legal entity. With this option, you can still perform actions as a legal entity through Employer of Record.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={`${props.params.org_id}/people/new?type=employee`}>
									Add Employee
								</Link>
							</CardContent>
						</Card>
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
				<ClientTable orgId={props.params.org_id} data={data as unknown as PERSON[]} />
			</Suspense>
		</div>
	);
}
