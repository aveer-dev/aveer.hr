import { Suspense } from 'react';
import { ApprovalPolicy } from './approval-policy';
import { FormSection, FormSectionDescription, InputsContainer } from '../forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ApprovalPolicies = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('approval_policies').select().eq('org', org);
	if (!data || error) return;

	return (
		<Suspense>
			<FormSection id="poicies">
				<FormSectionDescription>
					<h2 className="mb-1 font-normal">Approval Policies</h2>
					<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">How do you want requests (like time-off, e.t.c) accross the organisation to be approved, set them up with policies</p>
				</FormSectionDescription>

				<InputsContainer>
					{data.map(policy => (
						<ApprovalPolicy org={org} key={policy.id} data={policy} />
					))}

					<ApprovalPolicy className={cn(buttonVariants())} org={org}>
						Create approval policy
					</ApprovalPolicy>
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
