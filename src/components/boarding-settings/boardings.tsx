import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { Boarding } from './boarding';
import { Card } from '@/components/ui/card';

interface props {
	org: string;
}

export const Boardings = async ({ org }: props) => {
	const supabase = await createClient();

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

					{data.length == 0 && <Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">You do not have any onboarding/offboarding checklist yet</Card>}

					<Boarding org={org} />
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
