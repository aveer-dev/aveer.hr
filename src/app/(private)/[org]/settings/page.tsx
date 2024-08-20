import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityForm } from './profile-security-form';
import { ProfileForm } from './profile-form';
import { createClient } from '@/utils/supabase/server';
import { OrgForm } from '@/app/(auth)/create-org/form';
import { TablesUpdate } from '@/type/database.types';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function SettingsPage({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) return <div>Unable to fetch user data</div>;

	const [profileResponse, organisationResponse, legalEntityResponse, salaryBands] = await Promise.all([
		await supabase.from('profiles').select().eq('id', user?.id).single(),
		await supabase.from('organisations').select().eq('subdomain', params.org).single(),
		await supabase.from('legal_entities').select().eq('org', params.org),
		await supabase.from('employee_levels').select().eq('org', params.org)
	]);

	const updatePassword = async (password: string) => {
		'use server';
		const supabase = createClient();

		const { error, data } = await supabase.auth.updateUser({ password });

		if (error) return error?.message;
		if (data.user) return 'Password updated successfully';
	};

	const updateOrg = async (payload: FormData) => {
		'use server';
		const supabase = createClient();

		const orgData: TablesUpdate<'organisations'> = { name: payload.get('org-name') as string, website: payload.get('website') as string, subdomain: payload.get('subdomain') as string };
		const { error } = await supabase.from('organisations').update(orgData).eq('subdomain', params.org);

		if (error) return error?.message;
		return 'Organisation updated successfully';
	};

	return (
		<div className="mx-auto max-w-4xl">
			<Tabs defaultValue={searchParams.type || 'personal'} className="">
				<div className="mb-6 flex items-center gap-4">
					<h1 className="text-xl font-semibold">Settings</h1>

					<TabsList className="mb-px h-8 py-px">
						<TabsTrigger value="personal" className="h-6">
							Personal
						</TabsTrigger>
						<TabsTrigger value="org" className="h-6">
							Organisation
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="org">
					{organisationResponse.data && (
						<div className="grid w-full gap-6">
							<div className="grid grid-cols-2 border-t border-t-border pt-10">
								<div>
									<h2 className="mb-1 font-normal">Company Details</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These are the legal details you provided while registering your company at the time of setup.</p>
								</div>

								<div className="mb-10 grid gap-8">
									<OrgForm formAction={updateOrg} data={organisationResponse.data} />
								</div>
							</div>
						</div>
					)}

					{organisationResponse.error && (
						<div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">
							Unable to fetch user data <p>{organisationResponse.error.message}</p>
						</div>
					)}

					{legalEntityResponse.data && (
						<div className="grid w-full gap-6">
							<div className="grid grid-cols-2 border-t border-t-border pt-10">
								<div>
									<h2 className="mb-1 font-normal">Legal Entities</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">These are the legal details you provided while registering your company at the time of setup.</p>
								</div>

								<div className="mb-10 grid gap-8">
									{legalEntityResponse.data.map(entity => (
										<Card key={entity.id} className="w-full text-left">
											<Link className="flex items-center justify-between p-4 text-xs" href={`./legal-entity/${entity.id}`}>
												<div>
													{entity.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
												</div>
												<ChevronRightIcon className="text-muted-foreground" size={14} />
											</Link>
										</Card>
									))}
									<Link href="./legal-entity/new" className={cn(buttonVariants(), 'w-full text-xs')}>
										Add Legal Entity
									</Link>
								</div>
							</div>
						</div>
					)}

					{legalEntityResponse.error && (
						<div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">
							Unable to fetch user data <p>{legalEntityResponse.error.message}</p>
						</div>
					)}

					{salaryBands.data && (
						<div className="grid w-full gap-6">
							<div className="grid grid-cols-2 border-t border-t-border pt-10">
								<div>
									<h2 className="mb-1 font-normal">Employee Bands</h2>
									<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">We automatically create a band for your every hire&apos;s contract, so help keep things organised. You can manage them all here.</p>
								</div>

								<div className="mb-10 grid gap-8">
									{salaryBands.data.map(band => (
										<Card key={band.id} className="w-full text-left">
											<button className="flex w-full items-center justify-between p-4 text-xs">
												<div>
													{band.level} • <span className="text-muted-foreground">{band.role}</span>
												</div>
												<div className="flex items-center gap-2">
													{new Intl.NumberFormat('en-US', {
														style: 'currency',
														currency: 'USD'
													}).format(band.salary)}
													<ChevronRight size={14} />
												</div>
											</button>
										</Card>
									))}
									<Link href="./legal-entity/new" className={cn(buttonVariants(), 'w-full text-xs')}>
										Add new band
									</Link>
								</div>
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="personal">
					<SecurityForm updatePassword={updatePassword} />

					{profileResponse.data && <ProfileForm data={profileResponse.data} />}
					{profileResponse.error && <div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">Unable to fetch user data</div>}
				</TabsContent>
			</Tabs>
		</div>
	);
}
