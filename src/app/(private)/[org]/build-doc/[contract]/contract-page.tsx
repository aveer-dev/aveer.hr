import { ContractDocument, ContractViewer } from './contract-document';
import { ContractForm } from './contract-form';

export const ContractBuilder = async () => {
	return (
		<section>
			<div>
				<h1>Contract Builder</h1>

				<div className="flex w-full gap-6">
					<ContractForm className="w-full" />

					<div className="w-fit shadow-md">
						<ContractViewer />
					</div>
				</div>
			</div>
		</section>
	);
};
