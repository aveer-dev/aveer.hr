import { createClient } from '@/utils/supabase/server';
import { Boarding } from './boarding';
import { Tables } from '@/type/database.types';
import { differenceInBusinessDays } from 'date-fns';
import { ROLE } from '@/type/contract.types';

interface props {
	org: string;
	onboardingId?: number | null;
	offboardingId?: number | null;
	contract: Tables<'contracts'>;
	reviewType: ROLE;
}

export const Boardings = async ({ org, onboardingId, offboardingId, contract, reviewType }: props) => {
	const supabase = await createClient();

	const [onboarding, offboarding] = await Promise.all([
		await supabase
			.from('boarding_check_lists')
			.select('*')
			.match(onboardingId ? { org, id: onboardingId } : { org, is_default: true, type: 'on' }),
		(contract.terminated_by || (contract.end_date && differenceInBusinessDays(contract.end_date, new Date()) <= 20)) &&
			(await supabase
				.from('boarding_check_lists')
				.select('*')
				.match(offboardingId ? { org, id: offboardingId } : { org, is_default: true, type: 'off' }))
	]);

	const [onboardingChecklist, offboardingChecklist] = await Promise.all([
		onboarding?.data?.length && (await supabase.from('contract_check_list').select('*').match({ org, boarding: onboarding?.data[0]?.id, contract: contract.id })),
		typeof offboarding !== 'string' && typeof offboarding !== 'boolean' && offboarding?.data?.length && (await supabase.from('contract_check_list').select('*').match({ org, boarding: offboarding?.data[0]?.id, contract: contract.id }))
	]);

	return (
		<section className="space-y-24">
			{onboarding?.data && onboarding?.data.length > 0 && (
				<Boarding
					state={typeof onboardingChecklist == 'object' && onboardingChecklist?.data && (onboardingChecklist?.data[0] as any)}
					type={onboarding.data[0]?.type}
					data={onboarding.data[0]?.checklist as any}
					contract={contract.id}
					boarding={onboarding?.data[0]?.id}
					org={org}
					reviewType={reviewType}
					policy={onboarding.data[0]?.policy}
				/>
			)}

			{(contract.terminated_by || contract.end_date) && typeof offboarding !== 'string' && typeof offboarding !== 'boolean' && typeof offboarding !== 'number' && offboarding?.data && offboarding?.data.length > 0 && (
				<Boarding
					state={typeof offboardingChecklist == 'object' && offboardingChecklist?.data && (offboardingChecklist?.data[0] as any)}
					type={offboarding.data[0]?.type}
					data={offboarding.data[0]?.checklist as any}
					contract={contract.id}
					boarding={offboarding?.data[0]?.id}
					org={org}
					reviewType={reviewType}
					policy={offboarding.data[0]?.policy}
				/>
			)}

			{(!onboarding?.data || !onboarding?.data.length) && (!(offboarding as any)?.data || !(offboarding as any)?.data.length) && (
				<div className="flex h-40 items-center justify-center rounded-md bg-accent/80 text-xs text-muted-foreground">
					<p>Boarding system hasn&apos;t been setup yet</p>
				</div>
			)}
		</section>
	);
};
