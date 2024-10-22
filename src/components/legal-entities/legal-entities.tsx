import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { ChevronRight, ChevronRightIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { FormSection, FormSectionDescription, InputsContainer } from '../forms/form-section';

export const LegalEntities = async ({ org }: { org: string }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('legal_entities').select().eq('org', org);

	if (error)
		return (
			<div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">
				<p>Unable to fetch legal entities</p>
				<p>{error.message}</p>
			</div>
		);

	return (
		<FormSection id="entities">
			<FormSectionDescription>
				<h2 className="mb-1 font-normal">Legal Entities</h2>
				<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are the legal details you provided while registering your company at the time of setup.</p>
			</FormSectionDescription>

			<InputsContainer>
				{data.map(entity => (
					<Link key={entity.id} className={cn(buttonVariants({ variant: 'outline' }), 'flex h-fit items-center justify-between p-4')} href={`./legal-entity/${entity.id}`}>
						<div>
							{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
						</div>
						<ChevronRightIcon className="text-muted-foreground" size={14} />
					</Link>
				))}

				{data.length == 0 && <Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">You do not have any legal entities yet</Card>}

				<Link href="./legal-entity/new" className={cn(buttonVariants(), 'flex w-full items-center justify-between')}>
					Add Legal Entity <ChevronRight size={12} />
				</Link>
			</InputsContainer>
		</FormSection>
	);
};
