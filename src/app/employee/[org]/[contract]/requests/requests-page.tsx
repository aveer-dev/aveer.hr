import { Applicants } from '@/components/contract/applicants';
import { BoardingsReview } from '@/components/contract/boarding-review';
import { Timeoff } from '@/components/contract/time-off';
import { buttonVariants } from '@/components/ui/button';
import { ContractRepository, ManagerRepository } from '@/dal';
import { cn } from '@/lib/utils';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const RequestsPageComponent = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { org, contract } = await params;

	const contractRepo = new ContractRepository();
	const managerRepo = new ManagerRepository();

	const { data, error } = await contractRepo.getByIdWithRelations(org, Number(contract));

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

	const manager = await managerRepo.getByContract({ contractId: data?.id });

	return (
		<>
			<Timeoff manager={manager && manager.data} reviewType={manager?.data ? 'manager' : 'employee'} contract={data} org={org} team={data?.team?.id} />

			<Applicants contract={data as any} org={org} manager={manager && manager.data} />

			<BoardingsReview manager={manager.data} contract={data} org={org} />
		</>
	);
};
