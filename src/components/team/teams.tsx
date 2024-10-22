import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { Team } from './team';
import { Tables } from '@/type/database.types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { Card } from '../ui/card';

interface props {
	org: string;
	teams?: PostgrestSingleResponse<Tables<'teams'>[]>;
}

export const Teams = async ({ org, teams }: props) => {
	const supabase = createClient();

	if (!teams) teams = await supabase.from('teams').select().eq('org', org);

	if (!teams.data || teams.error) return;

	return (
		<Suspense>
			<FormSection id="teams">
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Teams</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are all the teams or groups available accross your organisation. You can manage them here.</p>
				</FormSectionDescription>

				<InputsContainer>
					{teams.data?.map((team: any) => <Team key={team.id} org={org} data={team} />)}

					{teams.data?.length == 0 && <Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">You do not have any teams yet</Card>}

					<Team org={org} />
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
