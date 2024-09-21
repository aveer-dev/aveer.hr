import { FilePlus2, Folder, Info } from 'lucide-react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createClient } from '@/utils/supabase/server';
import { FileItems } from './file-items';
import { FileDropZone, FileUpload } from '@/components/file-management/file-upload-zone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface props {
	org: string;
	orgId: number;
}

export const Files = async ({ org, orgId }: props) => {
	const supabase = createClient();

	const [employees] = await Promise.all([await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, last_name, id)').match({ org, status: 'signed' })]);

	const removeDuplicatesByProperty = (array: any[]) => {
		const uniqueObjects = new Map();
		return array.filter(obj => {
			const key = obj.profile.id;
			if (!uniqueObjects.has(key)) {
				uniqueObjects.set(key, obj);
				return true;
			}
			return false;
		});
	};

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

							<FileUpload variant={'secondary'} path={`${orgId}/org-${orgId}`} className="ml-auto h-7 w-7 p-0">
								<FilePlus2 size={12} />
							</FileUpload>
						</div>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild className="ml-auto mr-3 text-muted-foreground">
									<Info size={12} />
								</TooltipTrigger>

								<TooltipContent>
									<p className="max-w-36 text-left text-muted-foreground">Files added here will be visible to every employee</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</AccordionTrigger>

					<AccordionContent>
						<FileDropZone path={`${orgId}/org-${orgId}`}>
							<ul className="space-y-3">
								<FileItems path={`${orgId}/org-${orgId}`} />
							</ul>
						</FileDropZone>
					</AccordionContent>
				</AccordionItem>

				<h2 className="mt-16 text-sm font-normal text-muted-foreground">Employees folders</h2>
				{employees?.data &&
					employees?.data.length > 0 &&
					removeDuplicatesByProperty(employees.data)?.map(employee => (
						<AccordionItem value={String(employee.id)} className="my-4" key={employee.id}>
							<AccordionTrigger className="py-4">
								<div className="flex items-center gap-3">
									<Folder size={14} className="fill-foreground" />
									<div className="text-sm font-light">
										{employee.profile?.first_name} {employee.profile?.last_name} - {employee.job_title}
									</div>

									<FileUpload variant={'secondary'} path={`${orgId}/${employee.profile?.id}`} className="ml-auto h-7 w-7 p-0">
										<FilePlus2 size={12} />
									</FileUpload>
								</div>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild className="ml-auto mr-3 text-muted-foreground">
											<Info size={12} />
										</TooltipTrigger>

										<TooltipContent>
											<p className="max-w-36 text-left text-muted-foreground">Files added here will be visible to only this employee</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
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
