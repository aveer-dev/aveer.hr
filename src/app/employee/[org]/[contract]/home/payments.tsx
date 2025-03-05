import { Tables } from '@/type/database.types';
import { cn, currencyFormat } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type contract = Tables<'contracts'> & { entity: Tables<'legal_entities'> & { incorporation_country: Tables<'countries'> & { currency_code: string } }; org: Tables<'organisations'> };

interface props {
	contract: contract;
}

export const Payments = async ({ contract }: props) => {
	return (
		<section className={cn(contract.status !== 'signed' && 'pointer-events-none opacity-50 blur-sm', 'w-full')}>
			<h2 className="mb-4 ml-2 text-sm font-normal text-support">Salary</h2>

			<div className="space-y-6">
				<div className="flex items-end gap-4">
					<h3 className="text-5xl font-bold">{currencyFormat({ value: contract.salary / 12, currency: contract.entity.incorporation_country?.currency_code })}</h3>
					<p className="mb-1 text-sm text-muted-foreground">Net, monthly</p>
				</div>

				<Separator />

				<div className="flex items-end gap-4">
					<h3 className="text-5xl font-bold">{currencyFormat({ value: contract.salary, currency: contract.entity.incorporation_country?.currency_code })}</h3>
					<p className="mb-1 text-sm text-muted-foreground">Net, annually</p>
				</div>
			</div>
		</section>
	);
};
