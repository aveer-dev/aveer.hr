import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityForm } from './profile-security-form';
import { ProfileForm } from '@/components/forms/profile-form';
import { createClient } from '@/utils/supabase/server';
import { OrgForm } from '@/app/(auth)/create-org/form';
import { TablesUpdate } from '@/type/database.types';
import { EmployeeBand } from '@/components/band/employee-band';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeBenefits } from '@/components/employee-benefits/employee-benefits';
import { LegalEntities } from '@/components/legal-entities/legal-entities';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { ApprovalPolicies } from '@/components/approval-policies';
import { Teams } from '@/components/team/teams';
import { Boardings } from '@/components/boarding-settings';
import { Files } from '@/components/files-settings';
import { OKRs } from '@/components/okr/okrs';
import { Appraisal } from '@/components/appraisal-forms/appraisal';
import { AdminUsers } from '@/components/admin-user/admins';
import { updatePassword } from '@/api/update-password';

export default async function SettingsPage({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) return <div>Unable to fetch user data</div>;

	const [profileResponse, organisationResponse, teamsResponse] = await Promise.all([
		await supabase.from('profiles').select().eq('id', user?.id).single(),
		await supabase.from('organisations').select().eq('subdomain', params.org).single(),
		await supabase.from('teams').select().eq('org', params.org)
	]);

	const updateOrg = async (payload: TablesUpdate<'organisations'>) => {
		'use server';
		const supabase = createClient();

		const { error } = await supabase.from('organisations').update(payload).eq('subdomain', params.org);

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
						<TabsTrigger value="files" className="h-6">
							Files
						</TabsTrigger>
						<TabsTrigger value="goals" className="h-6">
							OKRs
						</TabsTrigger>
						<TabsTrigger value="appraisal" className="h-6">
							Appraisal
						</TabsTrigger>
						<TabsTrigger value="users" className="h-6">
							Users
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="org">
					{organisationResponse.data && (
						<FormSection>
							<FormSectionDescription>
								<h2 className="mb-1 font-normal">Company Details</h2>
								<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are the legal details you provided while registering your company at the time of setup.</p>
							</FormSectionDescription>

							<InputsContainer>
								<OrgForm formAction={updateOrg} data={organisationResponse.data} />
							</InputsContainer>
						</FormSection>
					)}

					{organisationResponse.error && (
						<div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">
							Unable to fetch user data <p>{organisationResponse.error.message}</p>
						</div>
					)}

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<LegalEntities org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<EmployeeBand org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<Teams org={params.org} teams={teamsResponse} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<EmployeeBenefits org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<ApprovalPolicies org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<Boardings org={params.org} />
					</Suspense>
				</TabsContent>

				<TabsContent value="personal">
					<SecurityForm updatePassword={updatePassword} />

					{profileResponse.data && <ProfileForm data={profileResponse.data} />}
					{profileResponse.error && <div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">Unable to fetch user data</div>}
				</TabsContent>

				<TabsContent value="files">
					<Suspense fallback={<Skeleton className="h-56 w-full" />}>{organisationResponse?.data && <Files orgId={organisationResponse.data?.id} org={params.org} />}</Suspense>
				</TabsContent>

				<TabsContent value="goals">
					<FormSection>
						<FormSectionDescription>
							<h2 className="mb-1 font-normal">Organisation OKRs</h2>
							<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Setup regular organisation wide OKRs here, along with each OKR timeline</p>
						</FormSectionDescription>

						<InputsContainer>
							<OKRs org={params.org} />
						</InputsContainer>
					</FormSection>
				</TabsContent>

				<TabsContent value="appraisal" className="relative">
					<Appraisal teams={teamsResponse.data ? teamsResponse.data : []} org={params.org} />
				</TabsContent>

				<TabsContent value="users" className="relative">
					<AdminUsers org={params.org} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
