import { Info } from 'lucide-react';
import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { FileItems, FileLinks } from '@/components/file-management/file-items';
import { FileDropZone } from '@/components/file-management/file-upload-zone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddFile } from '../file-management/add-file-link';
import { TablesInsert } from '@/type/database.types';
import { DocumentRepository } from '@/dal/repositories/document.repository';

interface props {
	org: string;
	orgId: number;
	userProfileId: string;
}

export const Files = async ({ org, orgId, userProfileId }: props) => {
	const supabase = await createClient();

	const documentsRepo = new DocumentRepository();
	const [files, documents] = await Promise.all([await supabase.from('links').select('*, document(*)').match({ org }), documentsRepo.getUserAccessibleDocuments(org, userProfileId)]);

	const getLinks = (path: string) => files.data?.filter(file => file.path == path);

	const addLink = async (payload: TablesInsert<'links'>) => {
		'use server';

		const supabase = await createClient();

		const { error } = await supabase.from('links').upsert({ ...payload, org });
		if (error) return error.code == '23505' ? `Link with name '${payload.name}' already exists` : error.message;

		return true;
	};

	return (
		<Suspense>
			<Separator />

			<section className="relative mt-8">
				<div className="mb-6 flex items-center gap-2">
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

				<Tabs defaultValue="files" className="w-full">
					<TabsList className="flex w-fit">
						<TabsTrigger value="files">Files</TabsTrigger>
						<TabsTrigger value="links">Links</TabsTrigger>
					</TabsList>

					<TabsContent value="files">
						<FileDropZone path={`${orgId}/org-${orgId}`}>
							<FileItems path={`${orgId}/org-${orgId}`} />
						</FileDropZone>
					</TabsContent>

					<TabsContent value="links">
						<FileLinks org={org} links={getLinks(`${orgId}/org-${orgId}`)} />
					</TabsContent>
				</Tabs>

				<AddFile documents={documents} path={`${orgId}/org-${orgId}`} addLink={addLink} />
			</section>
		</Suspense>
	);
};
