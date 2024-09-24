import { createClient } from '@/utils/supabase/server';
import { EllipsisVertical, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DownloadFile } from '@/components/file-management/download-file';
import { DeleteFile } from '@/components/file-management/delete-file';
import { FileUpload } from '@/components/file-management/file-upload-zone';
import { cn } from '@/lib/utils';

interface props {
	path: string;
	readonly?: boolean;
}

export const FileItems = async ({ path, readonly }: props) => {
	const supabase = createClient();

	const files = await supabase.storage.from('documents').list(path);

	return files.data && files.data.length > 0 ? (
		<ul className="space-y-3 rounded-md bg-secondary/50 p-2 text-sm font-light">
			{files.data?.map(file => (
				<li key={file.id} className="flex w-full items-center justify-between rounded-md border-b px-2 py-2 last-of-type:border-none hover:bg-muted/40 focus-visible:bg-muted/40">
					<div className="flex items-center gap-3">
						<File size={14} />
						<div className="max-w-64 truncate text-sm font-light sm:max-w-96">{file.name}</div>
					</div>

					<div className="text-muted-foreground">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8" size={'icon'}>
									<EllipsisVertical size={12} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-fit" align="end">
								<DropdownMenuItem asChild>
									<DownloadFile path={`${path}/${file.name}`} />
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<DeleteFile path={`${path}/${file.name}`} />
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</li>
			))}
		</ul>
	) : (
		<div className={cn('flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-muted', !readonly ? 'h-48' : 'h-32')}>
			<p className="text-xs text-muted-foreground">No file items here yet</p>

			{!readonly && (
				<>
					<p className="text-xs text-muted-foreground">Drag and drop files here to upload or click the button below</p>
					<FileUpload variant={'outline'} className="mt-4" path={path} />
				</>
			)}
		</div>
	);
};
