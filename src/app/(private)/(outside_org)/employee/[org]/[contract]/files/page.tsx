import { createClient } from '@/utils/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { FileItems, FileLinks } from '@/components/file-management/file-items';
import { FileDropZone } from '@/components/file-management/file-upload-zone';
import { AddFile } from '@/components/file-management/add-file-link';
import { TablesInsert } from '@/type/database.types';
import { redirect } from 'next/navigation';

export default async function ProfilePage(props: { params: Promise<{ [key: string]: string }> }) {
	const params = await props.params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('contracts')
		.select(
			'*, profile:profiles!contracts_profile_fkey(first_name, last_name, email, id, nationality:countries!profiles_nationality_fkey(country_code, name)), org:organisations!contracts_org_fkey(name, id, subdomain), entity:legal_entities!contracts_entity_fkey(name, id, incorporation_country:countries!legal_entities_incorporation_country_fkey(country_code, name, currency_code))'
		)
		.eq('id', params.contract)
		.single();

	if (error) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contract</p>
				<p>{error?.message}</p>
			</div>
		);
	}

	if (data.status !== 'signed') redirect('./home');

	const files = await supabase.from('links').select().match({ org: params.org });
	const getLinks = (path: string) => files.data?.filter(file => file.path == path);

	const addLink = async (payload: TablesInsert<'links'>) => {
		'use server';

		const supabase = await createClient();

		const { error } = await supabase.from('links').upsert({ ...payload, org: data.org.subdomain });
		if (error) return error.code == '23505' ? `Link with name '${payload.name}' already exists` : error.message;

		return true;
	};

	return (
		<div className="w-full">
			<section className="relative mt-8">
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

				<AddFile path={`${data.org.id}/${data.profile?.id}`} addLink={addLink} />
			</section>
		</div>
	);
}
