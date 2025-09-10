import { Teams } from '@/components/contract/teams';
import { buttonVariants } from '@/components/ui/button';
import { ContractRepository, ManagerRepository, OrgSettingsRepository } from '@/dal';
import { cn } from '@/lib/utils';
import { isPast } from 'date-fns';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const TeamPageComponent = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { contract, org } = await params;

	const orgSettingsRepo = new OrgSettingsRepository();
	const contractRepo = new ContractRepository();
	const managerRepo = new ManagerRepository();

	const [{ data, error }, { data: orgSettings }] = await Promise.all([contractRepo.getByIdWithRelations(org, Number(contract)), orgSettingsRepo.getByOrg(org)]);

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	if (data?.status !== 'signed') redirect('./home');

	const manager = await managerRepo.getByContract({ contractId: Number(contract), team: data.team?.id });

	return data.team && (!data.terminated_by || (data.end_date && !isPast(data.end_date))) && <Teams orgSettings={orgSettings} currentUser={!!manager?.data ? 'manager' : 'profile'} name={data.team.name} contractId={data.id} org={org} team={data.team.id} />;
};
