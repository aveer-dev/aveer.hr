import { useDropZone, useFileUpload, useUploader } from './hooks';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { ChangeEvent, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
	const { loading, uploadFile } = useUploader({ onUpload });
	const { handleUploadClick, ref } = useFileUpload();
	const { draggedInside, onDrop, onDragEnter, onDragLeave } = useDropZone({ uploader: uploadFile });

	const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => (e.target.files ? uploadFile(e.target.files[0]) : null), [uploadFile]);

	if (loading) {
		return (
			<div className="flex min-h-[10rem] items-center justify-center rounded-lg bg-opacity-80 p-8">
				<LoadingSpinner className="text-neutral-500" />
			</div>
		);
	}

	const wrapperClass = cn('flex flex-col items-center justify-center px-8 py-10 rounded-lg bg-opacity-80', draggedInside && 'bg-neutral-100');

	return (
		<Tabs defaultValue="account" className="w-full bg-muted">
			<TabsList className="grid w-fit grid-cols-2">
				<TabsTrigger value="account">Upload</TabsTrigger>
				<TabsTrigger value="password">Add link</TabsTrigger>
			</TabsList>

			<TabsContent value="account">
				<div className={wrapperClass} onDrop={onDrop} onDragOver={onDragEnter} onDragLeave={onDragLeave} contentEditable={false}>
					<ImageIcon size={36} className="mb-4 text-black opacity-20 dark:text-white" />
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="text-center text-sm font-light text-neutral-400 dark:text-neutral-500">{draggedInside ? 'Drop image here' : 'Drag and drop or'}</div>
						<div>
							<Button disabled={draggedInside} className="gap-4" onClick={handleUploadClick}>
								<Upload size={14} />
								Upload an image
							</Button>
						</div>
					</div>
					<input className="h-0 w-0 overflow-hidden opacity-0" ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={onFileChange} />
				</div>
			</TabsContent>

			<TabsContent value="password">
				<div className={wrapperClass} onDrop={onDrop} onDragOver={onDragEnter} onDragLeave={onDragLeave} contentEditable={false}>
					<input className="h-0 w-0 overflow-hidden opacity-0" type="url" />
				</div>
			</TabsContent>
		</Tabs>
	);
};

export default ImageUploader;
