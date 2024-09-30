'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronRightIcon } from 'lucide-react';

import { Tables } from '@/type/database.types';
import { OKRForm } from './okr-form';
import { format } from 'date-fns';
import { useState } from 'react';

interface props {
	org: string;
	okr?: Tables<'okrs'>;
	objResult?: any[];
}

export const OKR = ({ org, okr, objResult }: props) => {
	const [isOpen, toggle] = useState(false);

	return (
		<Sheet open={isOpen} onOpenChange={toggle}>
			<SheetTrigger asChild>
				<Button className="h-fit items-center justify-between px-4 py-3" variant={!!okr ? 'outline' : 'default'}>
					{!!okr && (
						<div className="text-left">
							<h3 className="text-sm font-normal">{okr?.title}</h3>
							<p className="mt-2 text-xs text-muted-foreground">
								{format(okr.start, 'PP')} - {format(okr.end, 'PP')}
							</p>
						</div>
					)}

					{!okr && 'Create OKR'}

					<ChevronRightIcon size={12} />
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto sm:w-4/5 sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Manages OKR</SheetTitle>
					<SheetDescription>Make changes to OKR here. Click save when you&apos;re done.</SheetDescription>
				</SheetHeader>

				<OKRForm toggleSheet={toggle} objResult={objResult} okr={okr} org={org} />
			</SheetContent>
		</Sheet>
	);
};
