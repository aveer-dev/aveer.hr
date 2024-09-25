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
		<ul className="h-72 space-y-1 overflow-y-auto rounded-md bg-muted px-2 pb-10 pt-4">
			{files.data?.map(file => (
				<li key={file.id} className="flex items-center gap-3 rounded-md px-4 py-2 transition-all focus-within:bg-foreground/[0.02] hover:bg-foreground/[0.02] focus:bg-foreground/[0.02] focus-visible:bg-foreground/[0.02]">
					<File size={14} className="text-muted-foreground" />
					<span className="max-w-64 truncate text-sm font-light sm:max-w-96">{file.name}</span>

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

							<DropdownMenuItem asChild>
								<DeleteFile path={`${path}/${file.name}`} />
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
