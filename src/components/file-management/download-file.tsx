'use client';

import { createClient } from '@/utils/supabase/client';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	path: string;
}

const supabase = createClient();

export const DownloadFile = ({ path }: props) => {
	const downloadFile = async () => {
		const loadingToast = toast.loading(
			<div className="flex gap-2">
				<LoadingSpinner /> <p className="font-normal">Downloading file</p>
			</div>
		);
		const { data, error } = await supabase.storage.from('documents').download(path);
		toast.dismiss(loadingToast);

		if (error) return toast.error('Error downloading file', { description: error.message });

		const url = URL.createObjectURL(data);
		const a = document.createElement('a');
		document.body.appendChild(a);
		a.style.display = 'none';
		a.href = url;
		a.download = url;
		a.click();
		URL.revokeObjectURL(url);

		toast.success('File downloaded successfully');
	};

	return (
		<Button onClick={downloadFile} variant={'ghost'} className="flex w-full cursor-pointer items-center justify-start gap-2 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0">
			<FileDown size={14} />
			<span>Download</span>
		</Button>
	);
};
