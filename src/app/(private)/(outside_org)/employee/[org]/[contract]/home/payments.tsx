import { PAYMENT } from '@/type/employee.types';
import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/type/database.types';
import { HardHat } from 'lucide-react';

type contract = Tables<'contracts'> & { entity: Tables<'legal_entities'> & { incorporation_country: Tables<'countries'> & { currency_code: string } }; org: Tables<'organisations'> };

interface props {
	contract: contract;
}

export const Payments = async ({ contract }: props) => {
	const supabase = createClient();

	const tableData: PAYMENT[] = [0, 1]?.map(() => ({
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

			<div className="flex h-40 flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-muted/60 p-4">
				{/* <ul className="w-full space-y-4">
					{tableData.map((payment, index) => (
						<li key={index} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm drop-shadow-sm">
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
				</ul> */}

				<HardHat size={16} />
				<p className="text-xs font-light text-muted-foreground">This section is almost here. We&apos;re adding a couple of finishing touches. 😉</p>
			</div>
		</section>
	);
};
