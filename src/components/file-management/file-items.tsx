import { createClient } from '@/utils/supabase/server';
import { ArrowUpRight, EllipsisVertical, File, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DownloadFile } from '@/components/file-management/download-file';
import { DeleteFile, DeleteLink } from '@/components/file-management/delete-file';
import { FileUpload } from '@/components/file-management/file-upload-zone';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { Fragment, ReactNode } from 'react';
import Link from 'next/link';
import { Separator } from '../ui/separator';

interface props {
	path: string;
	readonly?: boolean;
}

const Item = ({ children, name, className, description }: { children?: ReactNode; name: string; className?: string; description?: ReactNode }) => {
	return (
		<li className={cn('flex min-h-12 items-center gap-3 rounded-md px-4 py-2 transition-all focus-within:bg-foreground/[0.05] hover:bg-foreground/[0.05] focus:bg-foreground/[0.05] focus-visible:bg-foreground/[0.05]', className)}>
			<File size={14} className="text-muted-foreground" />
			<div>
				<h4 className="max-w-64 truncate text-xs font-light sm:max-w-96">{name}</h4>
				{!!description && <p className="mt-1 text-xs font-light text-muted-foreground">{description}</p>}
			</div>
			{children}
		</li>
	);
};

export const FileItems = async ({ path, readonly }: props) => {
	const supabase = await createClient();

	const files = await supabase.storage.from('documents').list(path);

	return files.data && files.data.length > 0 ? (
		<ul className="h-72 space-y-1 overflow-y-auto rounded-md bg-muted/70 px-2 pb-10 pt-4">
			{files.data?.map((file, index) => (
				<Fragment key={file.id}>
					<Item name={file.name} key={file.id}>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="secondary" className="ml-auto h-8 w-8" size={'icon'}>
									<EllipsisVertical size={12} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-fit" align="end">
								<DropdownMenuItem asChild>
									<DownloadFile path={`${path}/${file.name}`} />
								</DropdownMenuItem>

								{!readonly && (
									<DropdownMenuItem asChild>
										<DeleteFile path={`${path}/${file.name}`} />
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</Item>

					{index !== files.data.length - 1 && <Separator className="my-2" />}
				</Fragment>
			))}
		</ul>
	) : (
		<div className={cn('flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-muted/70', !readonly ? 'h-48' : 'h-32')}>
			<p className="text-xs text-muted-foreground">No file items here yet</p>

			{!readonly && (
				<>
					<p className="text-xs text-muted-foreground">Drag and drop files here to upload or click the button below</p>
					<FileUpload button variant={'outline'} className="mt-4" path={path} />
				</>
			)}
		</div>
	);
};

export const FileLinks = ({ links, org }: { links?: Tables<'links'>[]; org?: string }) => {
	return links && links.length > 0 ? (
		<ul className="h-72 space-y-2 overflow-y-auto rounded-md bg-muted/70 px-2 pb-10 pt-4">
			{links?.map((file, index) => (
				<Fragment key={file.id}>
					<Link href={file.link} key={file.id} passHref target="_blank" className="block" referrerPolicy="no-referrer">
						<Item
							name={file.name}
							className="cursor-pointer"
							description={
								<span className="flex items-center gap-2">
									<Link2 size={10} /> <span className="max-w-64 truncate sm:max-w-96">{file.link}</span>
								</span>
							}>
							<div className="ml-auto flex items-center gap-3">
								{org && <DeleteLink org={org} id={file.id} />}
								<ArrowUpRight size={12} className="mt-1" />
							</div>
						</Item>
					</Link>

					{index !== links.length - 1 && <Separator className="my-2" />}
				</Fragment>
			))}
		</ul>
	) : (
		<div className={cn('flex h-32 flex-col items-center justify-center gap-2 rounded-md bg-muted/70')}>
			<p className="text-xs text-muted-foreground">No file links here yet</p>
		</div>
	);
};
