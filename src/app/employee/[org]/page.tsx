import { cn } from '@/lib/utils';
import { ChevronRight, Undo2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';

export default async function EmployeeOrgPage(props: { params: Promise<{ [key: string]: string }>; searchParams?: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const searchParams = props.searchParams ? await props.searchParams : {};
	const supabase = await createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();

	if (!user || userError) return redirect('/app/login');

	const { data, error } = await supabase.from('contracts').select('id, job_title, status, org(name, subdomain)').eq('profile', user.id).eq('org', params.org);

	const page = searchParams.page || 'home';

	if (Array.isArray(data) && data.length === 1) return redirect(`./${params.org}/${data[0].id}/${page}`);

	if (Array.isArray(data) && data.length > 1) {
		return (
			<>
				<Header />

				<div className="mx-auto my-40 h-[50vh] w-full max-w-md space-y-6 py-10">
					<h1 className="text-sm font-medium">Looks like you have multiple contracts with {data[0].org.name}.</h1>

					<div className="mt-4 w-full max-w-sm space-y-2">
						<p className="text-sm text-muted-foreground">Select contract</p>

						<Card>
							<CardContent className="p-2">
								<ul className="space-y-2">
									{data.map((contract, index) => (
										<>
											<li key={contract.id}>
												<Link href={`./${params.org}/${contract.id}/${page}`} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-between')}>
													<p className="">{contract.job_title}</p>

													<div className="flex items-center gap-2">
														Open
														<ChevronRight size={12} />
													</div>
												</Link>
											</li>

											{index < data.length - 1 && <Separator />}
										</>
									))}
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</>
		);
	}

	if (!data || (Array.isArray(data) && data.length === 0) || error) {
		return (
			<div className="mx-auto my-48 flex min-h-56 w-full flex-col items-center justify-center gap-2 rounded-md bg-muted p-4 text-center text-xs text-muted-foreground">
				<p>Unable to find a contract for this organisation.</p>
				<p>{error?.message}</p>
				<Link href={'/app'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to home
				</Link>
			</div>
		);
	}
}
