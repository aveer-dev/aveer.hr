import { Folder } from 'lucide-react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createClient } from '@/utils/supabase/server';
import { FileItems } from './file-items';
import { FileDropZone } from '../contract/file-management/file-upload-zone';

interface props {
	org: string;
	orgId: number;
}

export const Files = async ({ org, orgId }: props) => {
	const supabase = createClient();

	const [employees] = await Promise.all([await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, last_name, id)').match({ org, status: 'signed' })]);

	return (
		<Suspense>
			<div className="mb-6 flex w-full items-center justify-between border-t py-8 pb-3">
				<h1 className="text-base font-medium">Files</h1>
			</div>

			<Accordion type="multiple" defaultValue={['org']} className="w-full">
				<AccordionItem value="org">
					<AccordionTrigger>
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-normal text-muted-foreground">Organisation files</h2>
						</div>
					</AccordionTrigger>

					<AccordionContent>
						<FileDropZone path={`${orgId}`}>
							<ul className="space-y-3">
								<FileItems path={`${orgId}`} />
							</ul>
						</FileDropZone>
					</AccordionContent>
				</AccordionItem>

				<h2 className="mt-16 pb-3 text-sm font-normal text-muted-foreground">Employees folders</h2>
				{employees?.data &&
					employees?.data.length > 0 &&
					employees?.data?.map(employee => (
						<AccordionItem value={String(employee.id)} className="my-4" key={employee.id}>
							<AccordionTrigger className="py-4">
								<div className="flex items-center gap-3">
									<Folder size={14} className="fill-foreground" />
									<div className="text-sm font-light">
										{employee.profile?.first_name} {employee.profile?.last_name} - {employee.job_title}
									</div>
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<FileDropZone path={`${orgId}/${employee.profile?.id}`}>
									<ul className="space-y-3">
										<FileItems path={`${orgId}/${employee.profile?.id}`} />
									</ul>
								</FileDropZone>
							</AccordionContent>
						</AccordionItem>
					))}
			</Accordion>
		</Suspense>
	);
};
