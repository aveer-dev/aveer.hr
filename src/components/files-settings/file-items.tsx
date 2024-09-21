import { createClient } from '@/utils/supabase/server';
import { EllipsisVertical, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DownloadFile } from '../contract/file-management/download-file';
import { DeleteFile } from '../contract/file-management/delete-file';

interface props {
	path: string;
}

export const FileItems = async ({ path }: props) => {
	const supabase = createClient();

	const files = await supabase.storage.from('documents').list(path);

	return files.data && files.data.length > 0 ? (
		files.data?.map(file => (
			<li key={file.id} className="flex items-center gap-3 rounded-md border-b px-2 py-2 last-of-type:border-none hover:bg-muted/40">
				<File size={14} />
				<div className="text-sm font-light">{file.name}</div>

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
		))
	) : (
		<div className="flex h-24 items-center justify-center rounded-md bg-muted">
			<p className="text-xs text-muted-foreground">No file items here yet</p>
		</div>
	);
};
