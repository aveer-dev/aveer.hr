import { Suspense } from 'react';
import { ApprovalPolicy } from './approval-policy';
import { FormSection, FormSectionDescription, InputsContainer } from '../forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { Button } from '../ui/button';

export const ApprovalPolicies = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('approval_policies').select().eq('org', org);
	if (!data || error) return;

	return (
		<Suspense>
			<FormSection>
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Approval Policies</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">How do you want requests (like time-off, e.t.c) accross the organisation to be approved, set them up with policies</p>
				</FormSectionDescription>

				<InputsContainer>
					{data.map(policy => (
						<ApprovalPolicy key={policy.id} data={policy} />
					))}
					<Button className="w-full">Create approval policy</Button>
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
