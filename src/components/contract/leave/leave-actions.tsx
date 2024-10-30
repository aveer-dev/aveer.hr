'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LeaveRequestDialog } from './leave-request-dialog';
import { Tables } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

interface props {
	org: string;
	id: number;
	onDelete?: () => void;
	contract: Tables<'contracts'>;
	data: Tables<'time_off'>;
	orgSettings: Tables<'org_settings'> | null;
}

const supabase = createClient();

export const LeaveActions = ({ org, id, onDelete, contract, data, orgSettings }: props) => {
	const [isDeleting, setDeleteState] = useState(false);
	const router = useRouter();

	const deleteLeave = async () => {
		setDeleteState(true);
		const { error } = await supabase.from('time_off').delete().match({ org, id });
		setDeleteState(false);
		if (error) return toast.error('Error deleting leave request', { description: error.message });
		router.refresh();
		onDelete && onDelete();
	};

	return (
		<div className="mt-2 flex items-center gap-1">
			<Button disabled={isDeleting} onClick={deleteLeave} variant={'ghost'} className="h-6 text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive focus-visible:ring-destructive">
				{isDeleting && <LoadingSpinner />} {!isDeleting && <Trash2 size={12} />}
			</Button>

			<LeaveRequestDialog orgSettings={orgSettings} contract={contract} data={data}>
				<Button variant={'ghost'} className="h-6">
					<Edit size={12} />
				</Button>
			</LeaveRequestDialog>
		</div>
	);
};
