'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LoadingSpinner } from '../ui/loader';

export const ViewFile = ({ path }: { path: string }) => {
	const supabase = createClient();
	const [isLoading, setIsLoading] = useState(false);

	const getSignedUrl = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 1 * 60); // 1 hour expiry

			if (error) {
				toast.error('Error getting file URL', { description: error.message });
				return;
			}

			if (data?.signedUrl) {
				window.open(data.signedUrl, '_blank');
			}
		} catch (error) {
			toast.error('Error accessing file');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button onClick={getSignedUrl} variant={'ghost'} className="flex w-full cursor-pointer items-center justify-start gap-2 hover:!ring-0 focus:!ring-0 focus-visible:!ring-0" disabled={isLoading}>
			{isLoading ? <LoadingSpinner /> : <ArrowUpRight size={14} />}
			<span>View Document</span>
		</Button>
	);
};
