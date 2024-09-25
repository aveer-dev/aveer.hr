import { Info, Link, Plus, UploadCloud } from 'lucide-react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createClient } from '@/utils/supabase/server';
import { FileItems } from '@/components/file-management/file-items';
import { FileDropZone, FileUpload } from '@/components/file-management/file-upload-zone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

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
			<Separator />

			<section className="relative mt-8 rounded-md border bg-muted/40 pt-4 shadow-sm">
				<div className="mb-6 flex items-center justify-between px-4">
					<h2 className="text-sm font-light text-muted-foreground">Organisation files</h2>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild className="text-muted-foreground">
								<button>
									<Info size={12} />
								</button>
							</TooltipTrigger>

							<TooltipContent>
								<p className="max-w-36 text-left text-muted-foreground">Files added here will be visible to every employee</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<FileDropZone path={`${orgId}/org-${orgId}`}>
					<FileItems path={`${orgId}/org-${orgId}`} />
				</FileDropZone>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="absolute bottom-2 right-2 rounded-full">
							<Plus size={12} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-fit" align="end" side="top">
						<DropdownMenuItem>
							<Link size={12} className="mr-2 text-muted-foreground" />
							<span>Add link</span>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<UploadCloud size={12} className="mr-2 text-muted-foreground" />
							<span>Upload document</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</section>

			<h2 className="mb-4 mt-16 text-sm font-normal text-muted-foreground">Employees folders</h2>
			<Accordion type="multiple" defaultValue={['org']} className="w-full space-y-4">
				{employees?.data &&
					employees?.data.length > 0 &&
					removeDuplicatesByProperty(employees.data)?.map(employee => (
						<AccordionItem value={String(employee.id)} className="rounded-md border bg-muted/40 shadow-sm" key={employee.id}>
							<AccordionTrigger className="px-2">
								<div className="flex items-center justify-between gap-1 px-4">
									<h2 className="text-sm font-light text-muted-foreground">
										{employee.profile?.first_name} {employee.profile?.last_name} - {employee.job_title}
									</h2>

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
								</div>
							</AccordionTrigger>

							<AccordionContent className="relative">
								<FileDropZone path={`${orgId}/${employee.profile?.id}`}>
									<FileItems path={`${orgId}/${employee.profile?.id}`} />
								</FileDropZone>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button className="absolute bottom-2 right-2 rounded-full">
											<Plus size={12} />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-fit" align="end" side="top">
										<DropdownMenuItem>
											<Link size={12} className="mr-2 text-muted-foreground" />
											<span>Add link</span>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<UploadCloud size={12} className="mr-2 text-muted-foreground" />
											<span>Upload document</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</AccordionContent>
						</AccordionItem>
					))}
			</Accordion>
		</Suspense>
	);
};
