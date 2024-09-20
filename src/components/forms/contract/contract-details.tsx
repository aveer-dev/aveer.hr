import { Button } from '@/components/ui/button';
import { Details } from '@/components/ui/details';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tables, TablesInsert } from '@/type/database.types';
import { Dispatch, ReactNode, SetStateAction } from 'react';

interface props {
	data: any;
	level?: TablesInsert<'employee_levels'>;
	back: Dispatch<SetStateAction<boolean>>;
	nationality?: Tables<'countries'>;
	formType: 'contract' | 'role';
	isManager?: boolean;
	team?: string;
	currency?: string;
	children: ReactNode;
}

export const ContractDetails = ({ data, level, back, nationality, formType, isManager, team, currency, children }: props) => {
	return (
		<section className="mx-auto grid max-w-4xl gap-20">
			<Details formType={formType} data={{ ...data, level, nationality }} isManager={isManager} team={team} back={back} currency={currency} />

			<div className="flex justify-end gap-4 border-t border-t-border pt-8">
				<Button
					onClick={() => {
						window.scrollTo({ top: 0, behavior: 'smooth' });
						back(false);
					}}
					variant={'outline'}>
					Back
				</Button>

				{children}
			</div>
		</section>
	);
};
