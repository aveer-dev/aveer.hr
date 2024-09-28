'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { CloudUpload, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes, DragEvent, ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { VariantProps } from 'class-variance-authority';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface props {
	children?: ReactNode;
	path: string;
	className?: string;
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

	if (uploadResponse.error) return toast.error(`Error uploading ${file.name}`, { description: uploadResponse.error.message });
	toast.success('Uploaded!', { description: `${file.name} has been uploaded successfully.` });
	return uploadResponse;
};

export const FileDropZone = ({ children, path, className }: props) => {
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
		window.addEventListener('drop', dragEndHandler);

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
		<div className={cn('relative grid w-full gap-10 pt-0', className)} onDrop={dropHandler}>
			{children}

			<div
				className={cn(
					'pointer-events-none absolute bottom-0 left-0 right-0 top-0 flex min-h-32 flex-col items-center justify-center space-y-4 rounded-md border bg-background text-center opacity-0 transition-all duration-500',
					dragIsActive && 'pointer-events-auto opacity-100'
				)}>
				<CloudUpload size={20} />
				<div className="text-xs text-muted-foreground">Drop file here to upload</div>
			</div>
		</div>
	);
};

export const FileUpload = ({ path, className, variant, children, button }: props & ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { button?: boolean }) => {
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
		<>
			{!button ? (
				<DropdownMenuItem
					onClick={event => {
						openFilePicker();
						event.stopPropagation();
					}}>
					<UploadCloud size={12} className="mr-2 text-muted-foreground" />
					<span>Upload document</span>
				</DropdownMenuItem>
			) : (
				<Button variant={variant} className={cn(className)}>
					{children ? (
						children
					) : (
						<>
							<UploadCloud size={12} className="mr-2 text-muted-foreground" />
							Upload document
						</>
					)}
				</Button>
			)}
		</>
	);
};
