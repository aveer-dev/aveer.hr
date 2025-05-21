import { createClient } from '@/utils/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { FileItems, FileLinks } from '@/components/file-management/file-items';
import { FileDropZone } from '@/components/file-management/file-upload-zone';
import { AddFile } from '@/components/file-management/add-file-link';
import { TablesInsert } from '@/type/database.types';
import { redirect } from 'next/navigation';
import { DocumentRepository } from '@/dal/repositories/document.repository';
import { Suspense } from 'react';
import { FileManagement } from '@/components/file-manager/files-page.component';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ProfilePage({ params }: { params: Promise<{ [key: string]: string }> }) {
	const contract = (await params).contract;
	const org = (await params).org;
	const supabase = await createClient();

	const { data, error } = await supabase.from('contracts').select('profile, status').eq('id', Number(contract)).single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (data.status !== 'signed') redirect('./home');

	// const documentsRepo = new DocumentRepository();
	// const [files, documents] = await Promise.all([supabase.from('links').select().match({ org: params.org }), documentsRepo.getUserAccessibleDocuments(params.org, data.profile?.id.toString() ?? '')]);

	// const getLinks = (path: string) => files.data?.filter(file => file.path == path);

	// const addLink = async (payload: TablesInsert<'links'>) => {
	// 	'use server';

	// 	const supabase = await createClient();

	// 	const { error } = await supabase.from('links').upsert({ ...payload, org: data.org.subdomain });
	// 	if (error) return error.code == '23505' ? `Link with name '${payload.name}' already exists` : error.message;

	// 	return true;
	// };

	return (
		<div className="w-full">
			<Suspense fallback={<Skeleton className="h-full min-h-[300px] w-full" />}>
				<FileManagement role="employee" userId={data.profile ?? org} params={params} />
			</Suspense>

			{/* <section className="relative mt-8">
				<div className="mb-6 flex items-center gap-2">
					<h2 className="text-base font-semibold text-support">Organisation files</h2>

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
						<FileItems readonly path={`${data.org.id}/org-${data.org.id}`} />
					</TabsContent>

					<TabsContent value="links">
						<FileLinks links={getLinks(`${data.org.id}/org-${data.org.id}`)} />
					</TabsContent>
				</Tabs>
			</section>

			<section className="relative mt-16">
				<div className="mb-6 flex items-center gap-2">
					<h2 className="text-base font-semibold text-support">Your files</h2>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild className="text-muted-foreground">
								<button>
									<Info size={12} />
								</button>
							</TooltipTrigger>

							<TooltipContent>
								<p className="max-w-36 text-left text-muted-foreground">Files added here is visible to company admin</p>
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
						<FileDropZone path={`${data.org.id}/${data.profile?.id}`}>
							<FileItems path={`${data.org.id}/${data.profile?.id}`} />
						</FileDropZone>
					</TabsContent>

					<TabsContent value="links">
						<FileLinks org={data.org.subdomain} links={getLinks(`${data.org.id}/${data.profile?.id}`)} />
					</TabsContent>
				</Tabs>

				<AddFile path={`${data.org.id}/${data.profile?.id}`} addLink={addLink} documents={documents} />
			</section> */}
		</div>
	);
}
