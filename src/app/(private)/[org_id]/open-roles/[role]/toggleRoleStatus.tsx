'use client';

import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Database } from '@/type/database.types';
import { toggleRoleStatus } from '../new/role.action';
import { useState } from 'react';

export const ToggleRoleStatus = ({ status, org, role }: { status: Database['public']['Enums']['role_status']; org: string; role: string }) => {
	const [state, setState] = useState(status);

	const toggleStatus = async (checked: boolean) => {
		await toggleRoleStatus(checked ? 'open' : 'close', role, org);
		setState(checked ? 'open' : 'close');
	};

	return (
		<div className={cn(buttonVariants({ variant: 'secondary' }), 'h-fit gap-2 py-1 text-xs font-light')}>
			{state}
			<Switch defaultChecked={state == 'open'} onCheckedChange={toggleStatus} className="scale-50" />
		</div>
	);
};
