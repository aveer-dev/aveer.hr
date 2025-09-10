import { Details } from '@/components/ui/details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveOverview } from './leave-overview';
import { Profile } from './profile/profile';
import { Teams } from './teams';
import { Timeoff } from './time-off';
import { Applicants } from './applicants';
import { Boardings } from './boarding';
import { BoardingsReview } from './boarding-review';
import { isPast } from 'date-fns';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';

export const EmployeeTabs = ({ data, orgSettings, signatureType, manager, org }: { data: any; orgSettings: Tables<'org_settings'> | null; signatureType: 'profile' | 'org' | 'manager'; manager?: Tables<'managers'>[] | null; org: string }) => {
	return (
		<Tabs defaultValue={data.profile_signed && data.org_signed ? 'profile' : 'contract'} className="space-y-6">
			{data.profile_signed && data.org_signed && (
				<div className="no-scrollbar flex items-center overflow-x-auto">
					<TabsList className={cn('mb-4 flex')}>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="leave">Leave</TabsTrigger>
						{data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && signatureType !== 'manager' && <TabsTrigger value="team">Team</TabsTrigger>}
						{signatureType == 'profile' && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <TabsTrigger value="requests">Requests</TabsTrigger>}
						<TabsTrigger value="contract">Contract</TabsTrigger>
						<TabsTrigger value="onboarding">Boarding</TabsTrigger>
					</TabsList>
				</div>
			)}

			<TabsContent value="leave">
				<LeaveOverview orgSettings={orgSettings} reviewType={manager?.length ? 'manager' : 'employee'} data={data as any} />
			</TabsContent>

			<TabsContent value="onboarding">
				<Boardings contract={data} org={org} onboardingId={data.onboarding} offboardingId={data.offboarding} reviewType={signatureType == 'org' ? 'admin' : manager?.length ? 'manager' : 'employee'} />
			</TabsContent>

			<TabsContent value="profile">
				<Profile type={signatureType as any} data={data.profile as any} />
			</TabsContent>

			{signatureType == 'profile' && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && (
				<TabsContent value="requests">
					<Timeoff manager={manager} reviewType={manager?.length ? 'manager' : 'employee'} contract={data} org={org} team={data?.team?.id} />

					<Applicants contract={data as any} org={org} manager={manager} />

					<BoardingsReview manager={manager} contract={data} org={org} />
				</TabsContent>
			)}

			<TabsContent value="team">{data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <Teams orgSettings={null} currentUser={signatureType as any} name={data.team.name} contractId={data.id} org={org} team={data.team.id} />}</TabsContent>

			<TabsContent value="contract">
				<section className="grid gap-14">
					{signatureType === 'profile' && (
						<div className="-mb-6 flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
							<InfoIcon size={12} />
							{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
						</div>
					)}

					<Details formType="contract" data={data} isManager={!!(manager && manager?.length > 0)} />
				</section>
			</TabsContent>
		</Tabs>
	);
};
