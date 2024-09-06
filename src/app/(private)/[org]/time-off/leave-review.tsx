import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { differenceInBusinessDays, format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface props {
	children: string;
	status: string;
	data: Tables<'time_off'> & { profile: Tables<'profiles'>; contract: Tables<'contracts'> };
}

export const LeaveReview = ({ data, children, status, ...props }: props & HTMLAttributes<HTMLButtonElement>) => {
	return (
		<Sheet>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<SheetTrigger asChild>
							<button {...props} className={cn('flex w-full items-center gap-2 overflow-hidden truncate rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-accent', props.className)}>
								<div className={cn(`${status == 'approved' ? 'bg-green-400' : status == 'denied' ? 'bg-red-400' : status == 'pending' ? 'bg-orange-400' : 'bg-gray-400'}`, 'h-2 w-2 rounded-full')}></div> <div className="w-10/12">{children}</div>
							</button>
						</SheetTrigger>
					</TooltipTrigger>

					<TooltipContent className="pl-2">
						<div className={cn(`${status == 'approved' ? 'border-l-green-400' : status == 'denied' ? 'border-l-red-400' : status == 'pending' ? 'border-l-orange-400' : 'border-l-gray-200'}`, 'border-l-4 pl-2 text-left capitalize')}>
							{children.split('|').map((text, index) => (
								<p key={index}>{text}</p>
							))}
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<SheetContent className="overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Leave Review</SheetTitle>
					<SheetDescription>See details of selected leave below</SheetDescription>
				</SheetHeader>

				<section className="mt-10 grid gap-4 py-4">
					<ul className="mb-10 space-y-6">
						<li className="space-y-2">
							<h2 className="text-xs text-muted-foreground">Employee</h2>
							<p className="text-xs leading-6">
								{data.profile.first_name} {data.profile.last_name}
							</p>
						</li>

						<li className="space-y-2">
							<h2 className="text-xs text-muted-foreground">Leave type</h2>
							<p className="text-xs capitalize leading-6">{data.leave_type} leave</p>
						</li>

						<li className="space-y-2">
							<h2 className="text-xs text-muted-foreground">Duration</h2>
							<p className="text-xs leading-6">
								{format(data.from, 'ccc')}, {format(data.from, 'PP')} - {format(data.to, 'ccc')}, {format(data.to, 'PP')} ({differenceInBusinessDays(data.to, data.from)} days)
							</p>
						</li>

						{data.note && (
							<li className="space-y-2">
								<h2 className="text-xs text-muted-foreground">Leave note</h2>
								<p className="text-xs leading-6">{data.note}</p>
							</li>
						)}

						{data.hand_over && (
							<li className="space-y-2">
								<h2 className="text-xs text-muted-foreground">Handing over to</h2>
								<p className="text-xs leading-6">{data.hand_over}</p>
							</li>
						)}

						{data.hand_over_note && (
							<li className="space-y-2">
								<h2 className="text-xs text-muted-foreground">Handover note</h2>
								<p className="text-xs leading-6">{data.hand_over_note}</p>
							</li>
						)}
					</ul>

					<h1 className="text-base font-bold">Approvals</h1>
					<ul className="mb-20">
						<li className="flex items-center justify-between">
							<div className="space-y-1">
								<h2 className="text-xs">Emmanuel Aina</h2>
								<p className="text-xs text-muted-foreground">HR Associate</p>
							</div>

							<div className="flex items-center gap-3">
								<Button className="flex h-7 items-center gap-2 bg-green-50 text-green-400 hover:bg-green-100 focus:ring-green-400 focus-visible:ring-green-400">
									<Check size={12} /> Approve
								</Button>
								<Button className="flex h-7 items-center gap-2 bg-red-50 text-red-400 hover:bg-red-100 focus:ring-red-400 focus-visible:ring-red-400">
									<X size={12} /> Decline
								</Button>
							</div>
						</li>

						<li className="-ml-2 mt-6 flex items-center justify-between border-l-4 pl-1">
							<div className="space-y-1">
								<h2 className="text-xs">Emmanuel Aina</h2>
								<p className="text-xs text-muted-foreground">HR Associate</p>
							</div>

							<div className="flex items-center gap-3 text-xs text-muted-foreground">Approved</div>
						</li>
					</ul>
				</section>
			</SheetContent>
		</Sheet>
	);
};
