import { currencyFormat } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PAYMENT } from '@/type/employee.types';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Tables } from '@/type/database.types';

type contract = Tables<'contracts'> & { entity: Tables<'legal_entities'> & { incorporation_country: Tables<'countries'> & { currency_code: string } }; org: Tables<'organisations'> };

interface props {
	contracts: contract[];
}

export const Payments = async ({ contracts }: props) => {
	const supabase = createClient();

	const tableData: PAYMENT[] = contracts?.map(contract => ({
		contract: contract.id,
		legal_entity: contract.entity.name,
		amount: contract.salary,
		date: new Date().toISOString(),
		org: contract.org.subdomain,
		entity_country: contract.entity.incorporation_country?.country_code || '',
		currency: contract.entity.incorporation_country?.currency_code || '',
		org_name: contract.org.name
	}));

	return (
		<section>
			<h2 className="mb-4 ml-2 text-sm font-normal text-support">Upcoming payments</h2>

			<div className="flex overflow-hidden rounded-3xl bg-muted/60 p-4">
				<ul className="w-full space-y-4">
					{tableData.map(payment => (
						<li key={payment.contract} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm drop-shadow-sm">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<h4 className="text-sm">{payment.org_name}</h4>
									<Badge variant={'outline'}>{payment.entity_country}</Badge>
								</div>

								<p className="whitespace-nowrap text-sm text-muted-foreground">{format(payment.date, 'PP')}</p>
							</div>

							<div className="text-right text-sm">
								<div>{currencyFormat({ value: payment.amount, currency: payment.currency })}</div>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};
