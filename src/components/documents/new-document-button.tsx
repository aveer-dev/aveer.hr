'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createDocument } from './document.actions';

export const NewDocumentButton = ({ org }: { org: string }) => {
	const [isLoading, setLoading] = useState(false);
	const router = useRouter();

	const onCreateDocument = async () => {
		setLoading(true);
		const { data, error } = await createDocument({ org });
		setLoading(false);

		if (error) return toast.error(error.message);
		router.push(`./documents/${data.id}`);
	};

	return (
		<Button onClick={onCreateDocument} className="flex h-72 w-full cursor-pointer items-center justify-center gap-2 rounded-md transition-all duration-500">
			{isLoading ? <LoadingSpinner /> : <Plus size="12" />} New Document
		</Button>
	);
};
