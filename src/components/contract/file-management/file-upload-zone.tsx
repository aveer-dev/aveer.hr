'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { CloudUpload, FilePlus2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DragEvent, ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	children?: ReactNode;
	path: string;
}

const supabase = createClient();

const isValidKey = (key: string): boolean => {
	// only allow s3/supabase safe characters
	return /^(\w|\/|!|-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/.test(key);
};

const uploadFile = async (file: File, fileName: string) => {
	if (!isValidKey(fileName)) return toast.error(`Error uploading ${file.name}`, { description: 'file contains restricted characters' });

	const loadingToast = toast.loading(
		<div className="flex gap-2">
			<LoadingSpinner /> <p className="font-normal">Uploading {file.name}</p>
		</div>
	);
	const uploadResponse = await supabase.storage.from('documents').upload(fileName, file, {
		cacheControl: '3600',
		upsert: false
	});
	toast.dismiss(loadingToast);

	if (uploadResponse.error) toast.error(`Error uploading ${file.name}`, { description: uploadResponse.error.message });
	toast.success('Uploaded!', { description: `${file.name} has been uploaded successfully.` });
	return uploadResponse;
};

export const FileDropZone = ({ children, path }: props) => {
	const [dragIsActive, setDragState] = useState(false);
	const router = useRouter();

	const dragOverHandler = (ev: any) => {
		ev.preventDefault();
		setDragState(true);
	};

	const dragEndHandler = (ev: any) => {
		ev.preventDefault();
		setDragState(false);
	};

	useEffect(() => {
		window.addEventListener('dragover', dragOverHandler);
		window.addEventListener('dragend', dragEndHandler);
		window.addEventListener('dragleave', dragEndHandler);

		return () => {
			window.removeEventListener('dragover', dragOverHandler);
			window.removeEventListener('dragend', dragEndHandler);
			window.removeEventListener('dragleave', dragEndHandler);
			setDragState(false);
		};
	}, []);

	const dropHandler = (ev: DragEvent<HTMLDivElement>) => {
		ev.preventDefault();
		setDragState(false);

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...ev.dataTransfer.items].forEach(async (item, i) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (!file) return;

					const fileName = `${path}/${file?.name}`;
					await uploadFile(file, fileName);
				}
			});
		} else {
			// Use DataTransfer interface to access the file(s)
			[...ev.dataTransfer.files].forEach(async (file, i) => {
				const fileName = `${path}/${file?.name}`;
				await uploadFile(file, fileName);
			});
		}

		router.refresh();
	};

	return (
		<div className={cn('relative grid gap-10 pt-0')} onDrop={dropHandler}>
			{children}

			<div className={cn('pointer-events-none absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center space-y-4 rounded-md border bg-background text-center opacity-0 transition-all duration-500', dragIsActive && 'pointer-events-auto opacity-100')}>
				<CloudUpload size={30} />
				<div className="text-xs text-muted-foreground">Drop file here to upload</div>
			</div>
		</div>
	);
};

export const FileUpload = ({ path }: props) => {
	const router = useRouter();

	const openFilePicker = () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.style.display = 'none';
		fileInput.multiple = true;

		fileInput.onchange = (event: any) => {
			for (const file of event.target.files) {
				if (!file) return;

				const fileName = `${path}/${file?.name}`;
				uploadFile(file, fileName);
			}

			router.refresh();
		};

		fileInput.click();
	};

	return (
		<Button onClick={openFilePicker} variant={'secondary'} className="h-9 gap-3">
			Add file
			<FilePlus2 size={14} />
		</Button>
	);
};
