'use client';

import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	path: string;
}

const supabase = createClient();

export const DeleteFile = ({ path }: props) => {
	const router = useRouter();

	const deleteFile = async () => {
		const loadingToast = toast.loading(
			<div className="flex gap-2">
				<LoadingSpinner /> <p className="font-normal">Deleting file</p>
			</div>
		);
		const { error } = await supabase.storage.from('documents').remove([path]);
		toast.dismiss(loadingToast);

		if (error) return toast.error('Error deleting file', { description: error.message });
		toast.success('File deleted successfully');
		router.refresh();
	};

	return (
		<Button onClick={deleteFile} variant={'ghost'} className="flex w-full cursor-pointer items-center justify-start gap-2 text-destructive hover:text-destructive hover:!ring-0 focus:text-destructive focus:!ring-0 focus-visible:text-destructive focus-visible:!ring-0">
			<Trash2 size={14} />
			<span>Delete</span>
		</Button>
	);
};

export const DeleteLink = ({ id, org }: { id: number; org: string }) => {
	const router = useRouter();

	const deleteLink = async (event: any) => {
		event.stopPropagation();

		const loadingToast = toast.loading(
			<div className="flex gap-2">
				<LoadingSpinner /> <p className="font-normal">Deleting link</p>
			</div>
		);
		const { error } = await supabase.from('links').delete().match({ org, id });
		toast.dismiss(loadingToast);

		if (error) return toast.error('Error deleting file', { description: error.message });
		toast.success('Link deleted successfully');
		router.refresh();
	};

	return (
		<Button variant="ghost_destructive" onClick={deleteLink} className="h-8 w-8" size={'icon'}>
			<Trash2 size={12} />
		</Button>
	);
};
