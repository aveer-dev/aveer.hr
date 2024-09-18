import { createClient } from '@/utils/supabase/server';
import { Boarding } from './boarding';
import { Tables } from '@/type/database.types';
import { differenceInBusinessDays } from 'date-fns';

interface props {
	org: string;
	onboardingId?: number | null;
	offboardingId?: number | null;
	contract: Tables<'contracts'>;
	userType: 'profile' | 'org';
}

export const Boardings = async ({ org, onboardingId, offboardingId, contract, userType }: props) => {
	const supabase = createClient();

	const [onboarding, offboarding] = await Promise.all([
		await supabase
			.from('boaring_check_list')
			.select('*')
			.match(onboardingId ? { org, id: onboardingId } : { org, is_default: true, type: 'on' }),
		(contract.terminated_by || (contract.end_date && differenceInBusinessDays(contract.end_date, new Date()) <= 20)) &&
			(await supabase
				.from('boaring_check_list')
				.select('*')
				.match(offboardingId ? { org, id: offboardingId } : { org, is_default: true, type: 'off' }))
	]);

	const [onboardingChecklist, offboardingChecklist] = await Promise.all([
		onboarding?.data?.length && (await supabase.from('contract_check_list').select('*').match({ org, boarding: onboarding?.data[0]?.id, contract: contract.id })),
		typeof offboarding !== 'string' && typeof offboarding !== 'boolean' && offboarding?.data?.length && (await supabase.from('contract_check_list').select('*').match({ org, boarding: offboarding?.data[0]?.id, contract: contract.id }))
	]);

	return (
		<section className="space-y-24">
			{onboarding?.data && (
				<Boarding
					state={typeof onboardingChecklist == 'object' && onboardingChecklist?.data && (onboardingChecklist?.data[0] as any)}
					type={onboarding.data[0]?.type}
					data={onboarding.data[0]?.checklist as any}
					contract={contract.id}
					boarding={onboarding?.data[0]?.id}
					org={org}
					userType={userType}
					policy={onboarding.data[0].policy}
				/>
			)}

			{(contract.terminated_by || contract.end_date) && typeof offboarding !== 'string' && typeof offboarding !== 'boolean' && typeof offboarding !== 'number' && offboarding?.data && (
				<Boarding
					state={typeof offboardingChecklist == 'object' && offboardingChecklist?.data && (offboardingChecklist?.data[0] as any)}
					type={offboarding.data[0]?.type}
					data={offboarding.data[0]?.checklist as any}
					contract={contract.id}
					boarding={offboarding?.data[0]?.id}
					org={org}
					userType={userType}
					policy={offboarding.data[0].policy}
				/>
			)}
		</section>
	);
};
