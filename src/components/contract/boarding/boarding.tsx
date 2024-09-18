'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables, TablesInsert } from '@/type/database.types';
import { useEffect, useState } from 'react';
import { updateEmployeeBoarding } from './boarding.action';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loader';
import { CHECKLIST } from '@/type/boarding.types';
import { Separator } from '@/components/ui/separator';
import { PanelRightOpen } from 'lucide-react';
import { BoardingReview } from './boarding-review';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface props {
	data: CHECKLIST[];
	type: 'on' | 'off';
	state?: (Tables<'contract_check_list'> & { checklist: CHECKLIST[] }) | null;
	contract: number;
	boarding: number;
	org: string;
	userType: 'profile' | 'org';
	policy: number;
}

const supabase = createClient();

export const Boarding = ({ data, type, state, contract, boarding, org, userType, policy }: props) => {
	const [items, updateItems] = useState<CHECKLIST[]>([]);
	const [requestingApproval, setRequestState] = useState(false);
	const [userState, updateUserState] = useState(state);

	useEffect(() => {
		updateUserState(state);
		if (!userState) return updateItems(data);

		const newItems = data.map(item => {
			const stateItem = userState.checklist.find((itm: any) => itm?.id == item.id);

			if (!stateItem) return item;
			return stateItem;
		});

		updateItems(newItems as any);
	}, [data, userState, state]);

	const onCheckChange = async (value: boolean | string, index: number) => {
		const checklist = structuredClone(items);
		if (value == true) checklist[index] = { ...checklist[index], created_at: String(new Date()) };
		if (value !== true) delete checklist[index].created_at;

		updateItems(checklist);

		const payload: TablesInsert<'contract_check_list'> = { contract, boarding, checklist: checklist as any, org };
		if (userState && userState.id) payload.id = userState.id;

		const response = await updateEmployeeBoarding(payload, org);
		if (typeof response == 'string') return toast.error('Unable to update checklist', { description: response });

		updateUserState(response as any);
		toast('Saved');
	};

	const getApprovalLevels = async () => {
		const { data, error } = await supabase.from('approval_policies').select().match({ id: policy, org }).single();
		if (error) toast.error('Error fetch policy', { description: error.message });

		return data?.levels;
	};

	const requestApproval = async () => {
		if (!userState) return;
		setRequestState(true);

		const payload = userState;
		payload.state = 'pending';

		if (policy) {
			const levels = await getApprovalLevels();
			if (levels) payload.levels = levels;
		}

		const response = await updateEmployeeBoarding(payload, org);

		setRequestState(false);
		if (typeof response == 'string') return toast.error('Unable send approval request', { description: response });

		updateUserState(response as any);
		toast.success('Approval request sent');
	};

	return (
		<div className="grid gap-4 py-4">
			<div className="mb-4 flex items-center justify-between border-b pb-3">
				<div className="flex items-center gap-2">
					<h2 className="text-lg font-medium">{type == 'on' ? 'On' : 'Off'}boarding checklist</h2>
					{(userState?.state == 'pending' || userState?.state == 'approved') && <Badge variant={userState?.state == 'pending' ? 'secondary-warn' : userState?.state == 'approved' ? 'secondary-success' : 'secondary'}>{userState?.state}</Badge>}
				</div>

				<div className="flex items-center gap-2">
					<div className="text-xs font-light text-muted-foreground">
						Checked {userState?.checklist?.length || 0}/{data.length}
					</div>

					{userState?.state == 'approved' && (
						<>
							<Separator orientation="vertical" className="h-3" />

							<BoardingReview data={state as any} reviewType={userType == 'org' ? 'admin' : ''}>
								<Button className="flex h-7 gap-2" variant={'secondary'}>
									Review
									<PanelRightOpen size={12} />
								</Button>
							</BoardingReview>
						</>
					)}
				</div>
			</div>

			{items && (
				<ul className="space-y-8">
					{items?.map((item, index) => (
						<li key={index} className="flex gap-4">
							<Checkbox
								disabled={userState?.state == 'pending' || userState?.state == 'approved' || userType == 'org'}
								onCheckedChange={value => onCheckChange(value, index)}
								checked={!!item.created_at}
								className="h-6 w-6 rounded-full border-border"
								id={`onboarding-${index}`}
							/>

							<label htmlFor={`onboarding-${index}`} className="peer-disabled:opacity-7 w-full space-y-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
								<div className="flex w-full">
									<h4>{item.item}</h4>
									{item.created_at && <p className="ml-auto text-xs font-light text-muted-foreground">{format(item.created_at, 'PP')}</p>}
								</div>

								<p className="text-xs font-light leading-5 text-muted-foreground">{item.description}</p>
							</label>
						</li>
					))}

					{!items.find(itm => !itm.created_at) && userType == 'profile' && userState?.state !== 'approved' && (
						<Button onClick={requestApproval} className="h-8 gap-2" disabled={!!items.find(itm => !itm.created_at) || userState?.state == 'pending' || requestingApproval}>
							{requestingApproval && <LoadingSpinner />} Request approval
						</Button>
					)}
				</ul>
			)}

			{!items && (
				<div className="flex h-32 items-center justify-center rounded-md bg-accent/70">
					<p className="text-xs text-muted-foreground">No boarding checklist item available</p>
				</div>
			)}
		</div>
	);
};
