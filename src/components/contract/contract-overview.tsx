import { ArrowUpRight, Info } from 'lucide-react';
import { Tables, TablesInsert } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { getChartData, LeaveRequestDialog, LeaveRequests } from './leave';
import { FileDropZone } from '@/components/file-management/file-upload-zone';
import { Separator } from '@/components/ui/separator';
import { FileItems, FileLinks } from '@/components/file-management/file-items';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROLE } from '@/type/contract.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddFile } from '../file-management/add-file-link';
import { LeaveStat } from './leave/leave-stat';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface props {
	data: Tables<'contracts'> & { profile: Tables<'profiles'>; org: Tables<'organisations'>; entity: Tables<'legal_entities'> & { incorporation_country: { currency_code: string } } };
	reviewType: ROLE;
}

export const ContractOverview = async ({ data, reviewType }: props) => {
	const supabase = createClient();

	const chartData = getChartData(data);

	const files = await supabase.from('links').select().match({ org: data.org.subdomain });
	const getLinks = (path: string) => files.data?.filter(file => file.path == path);

	const addLink = async (payload: TablesInsert<'links'>) => {
		'use server';

		const supabase = createClient();

		const { error } = await supabase.from('links').upsert({ ...payload, org: data.org.subdomain });
		if (error) return error.code == '23505' ? `Link with name '${payload.name}' already exists` : error.message;

		return true;
	};

	return (
		<section className="mt-6 flex w-full flex-wrap gap-14 space-y-6">
			{data?.direct_report && (
				<div className="flex w-full items-center justify-between rounded-2xl border bg-muted/40 p-2">
					<h2 className="p-2 text-sm font-light">Reports to</h2>

					<Link href={(data.direct_report as any) ? `./${(data.direct_report as any).id}` : ''} className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}>
						<p className="text-sm font-light">
							{(data.direct_report as any)?.profile?.first_name} {(data.direct_report as any)?.profile?.last_name}
						</p>
						<Separator className="h-3" orientation="vertical" />
						<ArrowUpRight size={12} />
					</Link>
				</div>
			)}

			{/* leave */}
			<div className="w-full">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Leave Days</h2>

					<div className="flex items-center gap-2">
						{data.status == 'signed' && (
							<>
								<LeaveRequestDialog contract={data} />
								<LeaveRequests reviewType={reviewType} org={data.org.subdomain} contract={data} />
							</>
						)}
					</div>
				</div>

				<div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
					{chartData.map(stat => (
						<LeaveStat key={stat.label} {...stat} org={data.org.subdomain} profile={(data.profile as any).id} />
					))}
				</div>

				{chartData.length == 0 && (
					<div className="flex gap-4">
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
					</div>
				)}
			</div>

			{/* documents */}
			<div className="w-full">
				<div className="mb-4">
					<h2 className="flex items-center justify-between text-xl font-bold">Files</h2>
				</div>

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
							<FileItems readonly path={`${data.org.id}/org-${data.org.id}`} />
						</TabsContent>

						<TabsContent value="links">
							<FileLinks links={getLinks(`${data.org.id}/org-${data.org.id}`)} />
						</TabsContent>
					</Tabs>
				</section>

				<section className="relative mt-16">
					<div className="mb-6 flex items-center gap-2">
						<h2 className="text-sm font-light text-muted-foreground">Your files</h2>

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
		</section>
	);
};
