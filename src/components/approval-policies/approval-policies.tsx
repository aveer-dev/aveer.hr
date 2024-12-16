import { Suspense } from 'react';
import { ApprovalPolicy } from './approval-policy';
import { FormSection, FormSectionDescription, InputsContainer } from '../forms/form-section';
import { createClient } from '@/utils/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export const ApprovalPolicies = async ({ org }: { org: string }) => {
	const supabase = await createClient();

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

					{data.length == 0 && <Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">You do not have any approval policy created yet.</Card>}

					<ApprovalPolicy className={cn(buttonVariants(), 'flex w-full items-center justify-between p-4')} org={org}>
						Create approval policy
						<ChevronRight size={12} />
					</ApprovalPolicy>
				</InputsContainer>
			</FormSection>
		</Suspense>
	);
};
