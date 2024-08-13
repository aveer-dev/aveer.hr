'use client';

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { PageLoader } from '../ui/page-loader';

export const DuplicateContract = ({ formAction }: { formAction: () => Promise<string> }) => {
	const duplicateContract = async () => {
		const error = await formAction();
		if (error) return toast.error(error);
	};

	const Loader = () => {
		const { pending } = useFormStatus();

		return pending && <PageLoader isLoading={pending} />;
	};

	return (
		<form action={duplicateContract}>
			<Button variant={'ghost'} className="w-full justify-start gap-2 focus:!ring-0">
				<Copy size={12} />
				Duplicate
			</Button>

			<Loader />
		</form>
	);
};
