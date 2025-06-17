import { FileManagement } from '@/components/file-manager/files-page.component';
import { ContractRepository } from '@/dal';
import { redirect } from 'next/navigation';

export const FilesPageComponent = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const { org, contract } = await params;

	const contractRepo = new ContractRepository();
	const { data, error } = await contractRepo.getByIdWithRelations(org, Number(contract));

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (data.status !== 'signed') redirect('./home');

	return <FileManagement role="employee" userId={data.profile ?? org} params={params} />;
};
