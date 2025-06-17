import { redirect } from 'next/navigation';
import { EmployeeAppraisalList } from '@/components/appraisal/employee-appraisal-list';
import { ContractRepository } from '@/dal/repositories/contract.repository';

export default async function AppraisalsPageComponent({ params }: { params: Promise<{ [key: string]: string }> }) {
	const { contract, org } = await params;

	const contractRepo = new ContractRepository();
	const { data: contractData, error } = await contractRepo.getByIdWithRelations(org, Number(contract));

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (contractData?.status !== 'signed') redirect('./home');

	return (
		<div className="mx-auto mt-0 max-w-3xl px-0 py-8 sm:mt-24">
			<h2 className="mb-24 text-4xl font-light">Appraisals</h2>

			<div className="space-y-6">
				<EmployeeAppraisalList org={org} contract={contractData} />
			</div>
		</div>
	);
}
