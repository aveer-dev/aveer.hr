import { AppraisalsDialog } from '@/components/appraisal/appraisals-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';

export default async function PerformancePage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const { data: appraisals, error } = await supabase.from('appraisal_history').select().match({ org: params.org });
	if (error) {
		return (
			<div className="flex min-h-48 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No appraisals yet, keep the ball rolling 🙂‍↕️.</p>
			</div>
		);
	}

	if (appraisals.length == 0) {
		return (
			<section className="mx-auto max-w-4xl">
				<div className="mb-6 flex items-center gap-4">
					<h1 className="text-xl font-bold">Appraisal</h1>
				</div>

				<div className="flex min-h-48 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
					<p>No appraisals yet, keep the ball rolling 🙂‍↕️.</p>
				</div>
			</section>
		);
	}

	// get user admin profile id for appraisal approval
	const {
		data: { user }
	} = await supabase.auth.getUser();

	const { data: contracts, error: contractsEror } = await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(*), level:employee_levels!contracts_level_fkey(*)').match({ org: params.org, status: 'signed' });

	return (
		<section className="mx-auto max-w-4xl">
			<div className="mb-6 flex items-center gap-4">
				<h1 className="text-xl font-bold">Appraisal</h1>
			</div>

			{appraisals.map((appraisal, index) => (
				<Accordion key={appraisal.id} type="single" collapsible className="w-full space-y-8">
					<AccordionItem value={`appraisal-${index}`}>
						<AccordionTrigger>
							<div className={cn('flex items-center gap-3')}>Appraisal {index + 1}</div>

							<span className="ml-auto mr-3 text-xs text-muted-foreground">
								{format(appraisal.created_at, 'MMM')} {format(appraisal.created_at, 'y')}
							</span>
						</AccordionTrigger>

						<AccordionContent>
							<ul key={appraisal.id}>{contracts?.map(contract => <Contract userId={user?.id} org={params.org} appraisal={appraisal.id} key={contract.id} contract={contract as any} />)}</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			))}
		</section>
	);
}

const Contract = async ({ contract, appraisal, org, userId }: { userId?: string; org: string; appraisal: number; contract: Tables<'contracts'> & { profile: Tables<'profiles'>; level: Tables<'employee_levels'> } }) => {
	const supabase = createClient();
	const { data, error } = await supabase.from('appraisal_answers').select().match({ contract: contract.id, org: contract.org, appraisal });

	return (
		<li className="flex items-center justify-between border-t px-1 py-6">
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<h4 className="text-xs">
						{contract.profile?.first_name} {contract.profile?.last_name}
					</h4>
					{(contract.level || contract.level_name) && (
						<Badge variant={'outline'} className="h-5 text-[10px]">
							{contract.level?.level || contract.level_name}
						</Badge>
					)}
				</div>

				<p className="text-xs text-muted-foreground">{contract.job_title}</p>
			</div>

			<div className="flex items-center gap-4 text-center text-xs text-muted-foreground *:space-y-2">
				<div>
					<div>Result</div>
					<div>{(!!data && data[0]?.org_submission_date && data[0].org_score) || '-'}</div>
				</div>
				<Separator orientation="vertical" className="h-3" />
				<div>
					<div>Employee</div>
					<div>{(!!data && data[0]?.submission_date && data[0].contract_score) || '-'}</div>
				</div>
				<Separator orientation="vertical" className="h-3" />
				<div>
					<div>Manager</div>
					<div>{(!!data && data[0]?.manager_submission_date && data[0].manager_score) || '-'}</div>
				</div>

				<Separator orientation="vertical" className="h-3" />

				<AppraisalsDialog adminId={userId} role={'admin'} org={org} contract={contract} />
			</div>
		</li>
	);
};
