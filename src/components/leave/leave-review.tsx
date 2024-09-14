'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { differenceInBusinessDays, format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HTMLAttributes, ReactNode, useCallback, useEffect, useId, useState } from 'react';
import { toast } from 'sonner';

interface props {
	children: ReactNode | string;
	data: Tables<'time_off'> & { profile: Tables<'profiles'>; contract: Tables<'contracts'> };
	reviewType: string;
}
interface DBLevel {
	type: string;
	id?: string;
	action: 'approved' | 'denied';
}
interface level {
	type: string;
	id?: string;
	action: 'approved' | 'denied';
	first_name: string;
	last_name: string;
	enabled: boolean;
}

const supabase = createClient();

export const LeaveReview = ({ data, reviewType, children, ...props }: props & HTMLAttributes<HTMLButtonElement>) => {
	const [levels, updateLevels] = useState<level[]>([]);
	const [dbLevels, updateDBLevels] = useState<DBLevel[]>([]);
	const [userId, setUserId] = useState<string>();
	const [isReviewOpen, setReviewState] = useState(false);
	const [isAnyLevelDenied, setDeniedLevelState] = useState(false);
	const [isUpdating, setUpdateState] = useState({ denying: false, approving: false });
	const [role, setRole] = useState<'admin' | 'manager'>();
	const router = useRouter();

	const getUserId = useCallback(async () => {
		if (userId) return userId;

		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (error) return router.push('/login');
		setUserId(() => user?.id);

		return user?.id;
	}, [router, userId]);

	const getPeopleInLevels = useCallback(async (profileId: string) => {
		const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', profileId).single();
		if (error) return;

		return data;
	}, []);

	const processLevels = useCallback(
		async (dataLevels: any[]) => {
			const newLevels: any = [];
			for (let i = 0; i < dataLevels.length; i++) {
				const level = dataLevels[i];

				if (level?.action) {
					const details = await getPeopleInLevels(level?.id);
					newLevels.push({ ...level, ...details, enabled: level.type == role });

					if (level.action == 'denied') setDeniedLevelState(true);
				} else {
					newLevels.push({ ...level, enabled: level.type == role });
				}
			}

			updateDBLevels(() => data.levels as any);
			updateLevels(() => newLevels);
		},
		[data.levels, getPeopleInLevels, role]
	);

	const getManagerStatus = useCallback(async (team: number, org: string, profile: string) => {
		const { data, error } = await supabase.from('managers').select('id').match({ team, org, profile });
		if (error) return toast.error('Unable to check manager status', { description: error.message });
		if (data && data.length) setRole(() => 'manager');
	}, []);

	useEffect(() => {
		if (reviewType == 'admin') setRole(() => 'admin');

		if (isReviewOpen) {
			getUserId().then(async userId => {
				if (reviewType !== 'admin' && data.contract?.team && data.org && userId) await getManagerStatus(data.contract.team, data.org, userId);
				if (data.levels) processLevels(data.levels);
			});
		}
	}, [data, getManagerStatus, getUserId, isReviewOpen, processLevels, reviewType, userId]);

	const updateLeave = async (levels: DBLevel[]) => {
		const isAnyDenied = !!levels.find(level => level.action == 'denied');
		const isAllApproved = !levels.find(level => level.action == 'denied' || !level.action);
		const { error } = await supabase
			.from('time_off')
			.update({ levels: levels as any, status: isAllApproved ? 'approved' : isAnyDenied ? 'denied' : 'pending' })
			.eq('id', data.id);

		if (isAllApproved) {
			await supabase
				.from('contracts')
				.update({ [`${data.leave_type}_leave_used`]: differenceInBusinessDays(data.to, data.from) + 1 + Number(data.contract[`${data.leave_type}_leave_used`] as any) })
				.eq('id', data.contract.id);
		}

		setUpdateState({ denying: false, approving: false });
		if (error) return toast.error('Unable to update leave', { description: error.message });

		toast.success('Leave updated successfully');
		setReviewState(false);
		router.refresh();
	};

	const LeaveActions = ({ className, index, level }: { className?: string; index: number; level: level }) => {
		const onAction = (action: 'approved' | 'denied') => {
			if (!userId) return toast.error('User not found');

			setUpdateState({ denying: action == 'denied', approving: action == 'approved' });
			const newDBLevel: any = { ...dbLevels[index], action, id: userId };
			dbLevels[index] = newDBLevel;
			updateDBLevels(() => dbLevels);

			updateLeave(dbLevels);
		};

		return (
			<div className={cn('flex items-center gap-3', className)}>
				<Button onClick={() => onAction('approved')} className="flex h-7 items-center gap-2 bg-green-50 text-green-400 hover:bg-green-100 focus:ring-green-400 focus-visible:ring-green-400">
					{!isUpdating.approving && <Check size={12} />} {isUpdating.approving && <LoadingSpinner className="text-green-400" />} Approve
				</Button>
				<Button onClick={() => onAction('denied')} className="flex h-7 items-center gap-2 bg-red-50 text-red-400 hover:bg-red-100 focus:ring-red-400 focus-visible:ring-red-400">
					{!isUpdating.denying && <X size={12} />}
					{isUpdating.denying && <LoadingSpinner className="text-red-400" />} Deny
				</Button>
			</div>
		);
	};

	return (
		<Sheet open={isReviewOpen} onOpenChange={setReviewState}>
			{typeof children == 'string' && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SheetTrigger asChild>
								<button {...props} className={cn('flex w-full items-center gap-2 overflow-hidden rounded-lg p-1 text-left text-xs capitalize text-muted-foreground transition-all duration-500 hover:bg-accent', props.className)}>
									<div className={cn(`${data.status == 'approved' ? 'bg-green-400' : data.status == 'denied' ? 'bg-red-400' : data.status == 'pending' ? 'bg-orange-400' : 'bg-gray-400'}`, 'h-2 w-2 rounded-full')}></div>{' '}
									<div className="w-10/12 truncate">{children}</div>
								</button>
							</SheetTrigger>
						</TooltipTrigger>

						<TooltipContent className="pl-2">
							<div className={cn(`${data.status == 'approved' ? 'border-l-green-400' : data.status == 'denied' ? 'border-l-red-400' : data.status == 'pending' ? 'border-l-orange-400' : 'border-l-gray-200'}`, 'border-l-4 pl-2 text-left capitalize')}>
								{children.split('|').map((text, index) => (
									<p key={index}>{text}</p>
								))}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
			{typeof children !== 'string' && <SheetTrigger asChild>{children}</SheetTrigger>}

			<SheetContent className="overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Leave Review</SheetTitle>
					<SheetDescription>See details of selected leave below</SheetDescription>
				</SheetHeader>

				<section className="mt-10 grid gap-4 py-4">
					<h1 className="text-base font-bold">Leave details</h1>
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
							<h2 className="text-xs text-muted-foreground">Duration </h2>
							<div className="text-xs leading-6">
								<p>
									<span className="text-muted-foreground">From:</span> {format(data.from, 'ccc')}, {format(data.from, 'PP')} - <span className="text-muted-foreground">To:</span> {format(data.to, 'ccc')}, {format(data.to, 'PP')}{' '}
									<span className="text-muted-foreground">({differenceInBusinessDays(data.to, data.from) + 1} days)</span>
								</p>
							</div>
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
								<p className="text-xs leading-6">
									{(data.hand_over as any).profile.first_name} {(data.hand_over as any).profile.last_name} • <span>{(data.hand_over as any).job_title}</span>
								</p>
							</li>
						)}

						{data.hand_over_note && (
							<li className="space-y-2">
								<h2 className="text-xs text-muted-foreground">Handover note</h2>
								<p className="text-xs leading-6">{data.hand_over_note}</p>
							</li>
						)}
					</ul>

					{data.levels && data.levels.length > 0 && (
						<>
							<h1 className="text-base font-bold">Approvals</h1>
							<ul className="mb-20 space-y-8">
								{levels?.map((level, index) => (
									<li key={index} className={cn('flex items-center justify-between', level.action && '-ml-2 border-l-4 pl-1', level.action == 'approved' ? 'border-l-green-200' : level.action == 'denied' ? 'border-l-red-200' : 'border-l-gray-200')}>
										<div className="space-y-1 capitalize">
											<h2 className="text-xs">{level?.type}</h2>
											{level.action && (
												<p className="text-xs text-muted-foreground empty:hidden">
													{level.first_name} {level.last_name}
												</p>
											)}
											{!level.action && <p className="text-xs font-light text-muted-foreground empty:hidden">Approval Level {index + 1}</p>}
										</div>

										{level.type !== role ? (
											<span className="text-xs font-light capitalize text-muted-foreground">{level.action || 'Pending approval'}</span>
										) : index == 0 ? (
											levels[0].action ? (
												<span className="text-xs font-light capitalize text-muted-foreground">{level.action}</span>
											) : (
												<LeaveActions index={index} level={level} className={cn(isAnyLevelDenied && 'opacity-30')} />
											)
										) : levels[index - 1].action ? (
											!level.action ? (
												<LeaveActions index={index} level={level} className={cn(isAnyLevelDenied && 'opacity-30')} />
											) : (
												<span className="text-xs font-light capitalize text-muted-foreground">{level.action}</span>
											)
										) : (
											<span className="text-xs font-light capitalize text-muted-foreground">Pending level {index} approval</span>
										)}
									</li>
								))}

								{!levels.length && (
									<>
										<li>
											<Skeleton className="h-10 w-full" />
										</li>
										<li>
											<Skeleton className="h-10 w-full" />
										</li>
									</>
								)}
							</ul>
						</>
					)}
				</section>
			</SheetContent>
		</Sheet>
	);
};
