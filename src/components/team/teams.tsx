import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { Team } from './team';

interface props {
	org: string;
}

export const Teams = async ({ org }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('teams').select().eq('org', org);
	if (!data || error) return;

	return (
		<Suspense>
			<FormSection>
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Teams</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are all the teams or groups available accross your organisation. You can manage them here.</p>
				</FormSectionDescription>

				<InputsContainer>
					{data.map(policy => (
						<Team key={policy.id} org={org} data={policy} />
					))}
					<Team org={org} />
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
