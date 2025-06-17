import { SignatureDrawer } from '@/components/contract/signature/signature-drawer';
import { ContractRepository, ManagerRepository } from '@/dal';
import { InfoIcon } from 'lucide-react';
import { Details } from '@/components/ui/details';

export const ContractPageComponent = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { org, contract } = await params;

	const contractRepo = new ContractRepository();
	const managerRepo = new ManagerRepository();

	const { data, error } = await contractRepo.getByIdWithRelations(org, Number(contract));

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	const manager = (await managerRepo.getByContract({ contractId: Number(contract), team: data.team?.id })).data;

	return (
		<section className="mx-auto mt-24 grid max-w-3xl gap-6 sm:mt-0">
			<div className="flex w-full items-center justify-between">
				<h2 className="text-4xl font-light">Contract details</h2>

				{data.profile && !data.profile_signed && <SignatureDrawer first_name={data.profile?.first_name} job_title={data.job_title} id={data.id} org={org} />}
			</div>

			{data.status == 'awaiting org signature' && (
				<div className="flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
					<InfoIcon size={12} />
					{`Contract is now pending signature from ${data.org.name}'s rep`}
				</div>
			)}

			<div className="flex w-fit items-center gap-3 rounded-sm border border-accent bg-accent px-3 py-2 text-xs font-thin">
				<InfoIcon size={12} />
				{`You can not edit your contract details. You'd need to reachout to your contact or manager to request an edit/change`}
			</div>

			<div className="mt-0 space-y-16 sm:mt-16">
				<Details formType="contract" data={data} isManager={!!manager} />
			</div>
		</section>
	);
};
