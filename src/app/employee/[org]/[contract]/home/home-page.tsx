import { Todos } from './todos';
import { Tables } from '@/type/database.types';
import { Info, Undo2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ContractStatus } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LeaveSummary } from './leave-summary';
import { CalendarsRepository, ContractRepository, TeamRepository, LeaveRepository, OrgSettingsRepository } from '@/dal';
import { EventsList } from './events-list';
import { FileDocumentListServer } from './file-document-list.server';

export default async function HomePageComponent(props: { params: Promise<{ [key: string]: string }> }) {
	const { org, contract: contractId } = await props.params;

	const contractsRepo = new ContractRepository();
	const leaveRepo = new LeaveRepository();
	const teamRepo = new TeamRepository();
	const calendarsRepo = new CalendarsRepository();
	const orgSettingsRepo = new OrgSettingsRepository();

	const [contract, employees, timeOffs, calendarEvents, teams, calendar, orgSettings] = await Promise.all([
		contractsRepo.getByIdWithRelations(org, Number(contractId)),
		contractsRepo.getAllByOrgWithProfileAndTeam(org),
		leaveRepo.getByContractWithRelations(org, Number(contractId)),
		calendarsRepo.getAllCalendarEventsByOrg(org),
		teamRepo.getAllByOrg(org),
		calendarsRepo.getCalendarById(1),
		orgSettingsRepo.getByOrg(org)
	]);

	if (contract.error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts</p>
				<p>{contract.error?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	const usedLeaveDays = timeOffs.data?.filter(item => item.status == 'approved' || item.status == 'pending') || [];

	return (
		<div className="mx-auto mt-24 max-w-3xl sm:mt-0">
			<section className="mb-8 flex w-full flex-col items-start justify-between gap-8 pb-8 sm:flex-row">
				<div className="order-2 w-full space-y-1 text-center sm:order-1">
					<h1 className="w-full text-2xl font-bold">Hi, {contract.data?.profile?.first_name}</h1>

					{contract && (
						<div className="flex items-center justify-center gap-3 text-xs font-light">
							<span className="capitalize">{contract.data?.job_title}</span> • <span className="capitalize">{contract.data?.org?.name}</span> • <span className="capitalize">{contract.data?.employment_type}</span>
							<ContractStatus state={contract.data?.status} start_date={contract.data?.start_date || ''} end_date={contract.data?.end_date} />
							{contract.data?.status == 'scheduled termination' && contract.data?.end_date && (
								<>
									•
									<Badge className="h-fit gap-3 py-1 text-xs font-light" variant={contract.data?.status.includes('term') ? 'secondary-destructive' : 'secondary'}>
										{format(contract.data?.end_date, 'PP')}
									</Badge>
								</>
							)}
						</div>
					)}
				</div>
			</section>

			{(contract.data?.status == 'awaiting org signature' || contract.data?.status == 'awaiting signature' || contract.data?.status == 'awaiting signatures') && (
				<div className="mb-5 flex w-full items-end justify-between gap-5 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
					<div className="flex gap-3">
						<Info size={16} />

						{contract.data?.status == 'awaiting org signature'
							? `Your employee portal is pending approval from a rep at ${contract.data?.org.name}`
							: `You'll need to sign the contract with ${contract.data?.org.name} to use this employee platforn. Click on review contract to review and sign the contract.`}
					</div>

					{(contract.data?.status == 'awaiting signature' || contract.data?.status == 'awaiting signatures') && (
						<Link className={cn(buttonVariants())} href={`./contract`}>
							Review contract
						</Link>
					)}
				</div>
			)}

			<div className="space-y-14">
				<EventsList contract={contract.data?.id} org={org} employees={employees.data} calendar={calendar.data} timeOffs={timeOffs.data || []} calendarEvents={calendarEvents.data || []} teams={teams.data || []} />

				<FileDocumentListServer org={org} />

				<LeaveSummary org={org} contract={contract.data} orgSettings={orgSettings.data} usedLeaveDays={usedLeaveDays || []} />

				<Todos profile={contract.data?.profile as Tables<'profiles'>} contract={contract.data} profileId={contract.data?.profile?.id} org={org} team={contract.data?.team as number} />

				{/* <Payments contract={contract as any} /> */}
			</div>
		</div>
	);
}
