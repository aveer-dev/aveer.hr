import { Tables } from '@/type/database.types';
import { Button } from '../ui/button';
import { cancelLeave } from './leave.actions';
import { useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loader';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';

interface props {
	data: Tables<'time_off'>;
}

export const LeaveCancelButton = ({ data }: props) => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const onCancel = async () => {
		try {
			setLoading(true);
			await cancelLeave(data);
			toast.success('Leave cancelled');
			router.refresh();
		} catch (error) {
			toast.error('Failed to cancel leave', { description: (error as Error).message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-between gap-2">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">
							<Info size={14} />
						</Button>
					</TooltipTrigger>

					<TooltipContent>
						<p className="max-w-40">Canceling a leave request will restore the leave balance and cancel the leave request.</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Button className="w-full" variant={'secondary_destructive'} onClick={onCancel} disabled={loading}>
				{loading ? <LoadingSpinner /> : 'Cancel'}
			</Button>
		</div>
	);
};
