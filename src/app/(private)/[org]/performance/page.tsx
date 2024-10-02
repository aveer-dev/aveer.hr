import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { OKRs } from '@/components/okr/okrs';
import { Appraisal } from '@/components/appraisal-forms/appraisal';

export default async function PerformancePage({ params }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	return (
		<section className="mx-auto max-w-4xl">
			<Tabs defaultValue={'goals'} className="">
				<div className="mb-6 flex items-center gap-4">
					<h1 className="text-xl font-bold">Performance</h1>

					<TabsList className="mb-px h-8 py-px">
						<TabsTrigger value="goals" className="h-6">
							OKRs / Appraisal
						</TabsTrigger>
						<TabsTrigger value="appraisal" className="h-6">
							Appraisal
						</TabsTrigger>
						<TabsTrigger value="metrics" className="h-6">
							Metrics
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="goals">
					<FormSection>
						<FormSectionDescription>
							<h2 className="mb-1 font-normal">Organisation OKRs</h2>
							<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">Setup regular organisation wide OKRs here, along with each OKR timeline</p>
						</FormSectionDescription>

						<InputsContainer>
							<OKRs org={params.org} />
						</InputsContainer>
					</FormSection>
				</TabsContent>

				<TabsContent value="appraisal" className="relative">
					<Appraisal org={params.org} />
				</TabsContent>
			</Tabs>
		</section>
	);
}
