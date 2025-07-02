'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tables } from '@/type/database.types';
import { useState } from 'react';

export const AppraisalCycleOptions = ({ cycle, org }: { cycle: Tables<'appraisal_cycles'>; org: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
						<MoreVertical size={14} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-44" align="end">
					<DropdownMenuItem onSelect={() => setIsOpen(true)}>Update Appraisal Cycle</DropdownMenuItem>

					<Link href={`./performance/${cycle.id}`}>
						<DropdownMenuItem>Review Appraisal Metrics</DropdownMenuItem>
					</Link>
				</DropdownMenuContent>
			</DropdownMenu>

			<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle} isOpen={isOpen} setIsOpen={setIsOpen} noAction />
		</div>
	);
};
