import { useDropZone, useFileUpload, useUploader } from './hooks';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, PenToolIcon, Signature, Upload } from 'lucide-react';
import { ChangeEvent, useCallback } from 'react';

export const SignaturePad = ({ onUpload }: { onUpload: (url: string) => void }) => {
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
		<div className={'flex w-52 flex-col items-center justify-center gap-4 rounded-md border bg-secondary py-4'} contentEditable={false}>
			<Signature size={28} className="text-primary opacity-80" />

			<Button className="w-24 gap-2" variant={'outline'}>
				<PenToolIcon size={12} />
				Sign
			</Button>
		</div>
	);
};

export default SignaturePad;
