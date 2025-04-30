import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';

import { AppraisalQuestionsTemplates } from '@/components/appraisal-forms/appraisal-questions-templates';
import { Button } from '@/components/ui/button';
import { QuestionTemplateDialog } from '@/components/appraisal-forms/question-template-dialog';
import { AppraisalCycleDialog } from '@/components/appraisal-forms/appraisal-cycle-dialog';
import { AppraisalCyclesList } from '@/components/appraisal-forms/appraisal-cycles-list';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon } from 'lucide-react';

export const AppraisalsPage = async ({ params }: { params: Promise<{ [key: string]: string }> }) => {
	const org = (await params)?.org;

	const supabase = await createClient();

	const { data: teams, error } = await supabase.from('teams').select('*').match({ org });

	if (error) {
		return <div>Error loading teams</div>;
	}

	return (
		<section>
			<div className="mb-6 flex items-center gap-4">
				<h1 className="text-xl font-bold">Appraisal</h1>
			</div>

			<Tabs defaultValue="templates" className="w-full">
				<div className="flex items-center justify-between">
					<TabsList className="flex w-fit">
						<TabsTrigger value="templates">Question Templates</TabsTrigger>
						<TabsTrigger value="cycles">Appraisal Cycles</TabsTrigger>
					</TabsList>

					<div className="flex gap-2">
						<TabsContent value="cycles" className="m-0">
							<AppraisalCycleDialog org={org}>
								<Button>
									<PlusIcon size={12} className="mr-2" />
									Add Appraisal Cycle
								</Button>
							</AppraisalCycleDialog>
						</TabsContent>

						<TabsContent value="templates" className="m-0">
							<QuestionTemplateDialog teams={teams} org={org}>
								<Button>
									<PlusIcon size={12} className="mr-2" />
									Create Question Template
								</Button>
							</QuestionTemplateDialog>
						</TabsContent>
					</div>
				</div>

				<TabsContent value="cycles" className="mt-4">
					<Suspense
						fallback={
							<div className="space-y-4">
								<Skeleton className="h-24 w-full" />
								<Skeleton className="h-24 w-full" />
								<Skeleton className="h-24 w-full" />
							</div>
						}>
						<AppraisalCyclesList org={org} />
					</Suspense>
				</TabsContent>

				<TabsContent value="templates" className="mt-4">
					<Suspense fallback={<Skeleton className="h-24 w-full" />}>
						<AppraisalQuestionsTemplates teams={teams} org={org} />
					</Suspense>
				</TabsContent>
			</Tabs>
		</section>
	);
};
