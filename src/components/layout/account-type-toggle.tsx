'use client';

import { Button, buttonVariants } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Building2, CheckCheck, ChevronDown, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const AccountTypeToggle = ({ orgId }: { orgId?: string }) => {
	const [isOpen, toggleOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpen}>
			<PopoverTrigger asChild>
				<Button variant="secondary" size={'sm'} className="mt-1 h-7 gap-3 rounded-full">
					{orgId ? 'Contractor' : 'Client'}
					<ChevronDown size={12} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Account type</h4>
						<p className="text-xs text-muted-foreground">How will you like to operate your account:</p>
					</div>
					<div className="grid gap-2">
						<Link href={`/`} onClick={() => toggleOpen(!isOpen)} className={cn(buttonVariants({ variant: 'ghost' }), 'justify-between')}>
							<div className="flex items-center gap-4">
								<Building2 size={12} />
								Client
							</div>
							{orgId && <CheckCheck size={12} />}
						</Link>
						<Link href={`/contractor`} onClick={() => toggleOpen(!isOpen)} className={cn(buttonVariants({ variant: 'ghost' }), 'justify-between')}>
							<div className="flex items-center gap-4">
								<UserRound size={12} /> Contractor
							</div>
							{!orgId && <CheckCheck size={12} />}
						</Link>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
