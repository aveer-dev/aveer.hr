import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { Boarding } from './boarding';

interface props {
	org: string;
}

export const Boardings = async ({ org }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('boarding_check_lists').select().eq('org', org);
	if (!data || error) return error.message;

	return (
		<Suspense>
			<FormSection id="teams">
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Onboarding / Offboarding Checklist</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Automate your employee onboarding / offboarding system with adequate approval systems</p>
				</FormSectionDescription>

				<InputsContainer>
					{data.map(policy => (
						<Boarding key={policy.id} org={org} data={policy} />
					))}
					<Boarding org={org} />
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
