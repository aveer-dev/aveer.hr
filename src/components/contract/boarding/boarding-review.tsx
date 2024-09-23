'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CHECKLIST } from '@/type/boarding.types';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HTMLAttributes, ReactNode, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { approveBoarding } from './boarding.action';
import { ROLE } from '@/type/contract.types';

interface props {
	children?: ReactNode | string;
	data: Tables<'contract_check_list'> & { contract: Tables<'contracts'> };
	reviewType: ROLE;
	onReview?: (data: Tables<'contract_check_list'>) => void;
}

interface LEVEL {
	action?: string;
	id: string;
	level: number;
	type: string;
	first_name?: string;
	last_name?: string;
	created_at?: Date;
	is_employee?: boolean;
}

const supabase = createClient();

export const BoardingReview = ({ data, reviewType, children, onReview, ...props }: props & HTMLAttributes<HTMLButtonElement>) => {
	const [levels, updateLevels] = useState<LEVEL[]>([]);
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

				if (level?.id) {
					const details = await getPeopleInLevels(level?.id);
					newLevels.push({ ...level, ...details, enabled: level.type == role, is_employee: role != 'admin' && level.id == userId });

					if (level.action == 'denied') setDeniedLevelState(true);
				} else {
					newLevels.push({ ...level, enabled: level.type == role, is_employee: role != 'admin' && level.id == userId });
				}
			}

			updateLevels(() => newLevels);
		},
		[getPeopleInLevels, role, userId]
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

	const updateBoarding = async (levels: LEVEL[]) => {
		const isAllApproved = !levels.find(level => !level.action);

		const response = await approveBoarding({ isAllApproved, levels: levels, id: data.id });
		setUpdateState({ denying: false, approving: false });
		if (typeof response == 'string') return toast.error('Unable to approve boarding', { description: response });

		toast.success('Boarding approved');
		setReviewState(false);
		router.refresh();
		onReview && onReview(response);
	};

	const Actions = ({ className, index, level }: { className?: string; index: number; level: LEVEL }) => {
		const onAction = (action: 'approved' | 'denied') => {
			if (!userId) return toast.error('User not found');

			setUpdateState({ denying: action == 'denied', approving: action == 'approved' });
			const newLevels = levels.map(lv => {
				const item: LEVEL = { id: lv.id, level: lv.level, type: lv.type };
				lv.action && (item.action = lv.action);
				lv.created_at && (item.created_at = lv.created_at);
				return item;
			});
			const newLevel: LEVEL = { id: userId as string, level: level.level, type: level.type, action, created_at: new Date() };
			newLevels[index] = newLevel;

			updateBoarding(newLevels);
		};

		return (
			<div className={cn('flex items-center gap-3', className)}>
				<Button onClick={() => onAction('approved')} className="flex h-7 items-center gap-2 bg-green-100 text-green-500 hover:bg-green-100 focus:ring-green-400 focus-visible:ring-green-400">
					{!isUpdating.approving && <Check size={12} />} {isUpdating.approving && <LoadingSpinner className="text-green-400" />} Approve
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
									<div className={cn(`${data.state == 'approved' ? 'bg-green-400' : data.state == 'pending' ? 'bg-orange-400' : 'bg-gray-400'}`, 'h-3 w-[2px] rounded-sm')}></div>
									<div className="w-10/12 truncate">{children}</div>
								</button>
							</SheetTrigger>
						</TooltipTrigger>

						<TooltipContent className="pl-2">
							<div className={cn(`${data.state == 'approved' ? 'border-l-green-400' : data.state == 'pending' ? 'border-l-orange-400' : 'border-l-gray-200'}`, 'border-l-4 pl-2 text-left capitalize')}>
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
					<SheetTitle>Approval Review</SheetTitle>
					<SheetDescription>Review approvals for boarding</SheetDescription>
				</SheetHeader>

				<section className="mt-10 grid gap-4 py-4">
					<h1 className="text-base font-bold">Checklist</h1>
					<ul className="mb-10 space-y-6">
						{(data.checklist as unknown as CHECKLIST[]).map(item => (
							<li key={item.id} className="list-disc space-y-2">
								<h2 className="text-xs">{item.item}</h2>
								<p className="text-xs leading-6 text-muted-foreground">{item.description}</p>
							</li>
						))}
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

										{level.type !== role && !level.is_employee ? (
											<span className="text-xs font-light capitalize text-muted-foreground">{level.action || 'Pending approval'}</span>
										) : index == 0 ? (
											levels[0].action ? (
												<span className="text-xs font-light capitalize text-muted-foreground">{level.action}</span>
											) : (
												<Actions index={index} level={level} className={cn(isAnyLevelDenied && 'opacity-30')} />
											)
										) : levels[index - 1].action ? (
											!level.action ? (
												<Actions index={index} level={level} className={cn(isAnyLevelDenied && 'opacity-30')} />
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
