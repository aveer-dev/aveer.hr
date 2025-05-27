'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tables } from '@/type/database.types';

export const AppraisalCycleOptions = ({ cycle, org }: { cycle: Tables<'appraisal_cycles'>; org: string }) => {
	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
						<MoreVertical size={14} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-44" align="end">
					<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle}>
						<DropdownMenuItem
							onSelect={e => {
								e.stopPropagation();
								e.preventDefault();
							}}>
							Update Appraisal Cycle
						</DropdownMenuItem>
					</AppraisalCycleDialog>

					<Link href={`./performance/${cycle.id}`}>
						<DropdownMenuItem>Review Appraisal Metrics</DropdownMenuItem>
					</Link>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
