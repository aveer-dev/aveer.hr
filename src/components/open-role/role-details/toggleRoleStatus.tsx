'use client';

import { buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Database } from '@/type/database.types';
import { toggleRoleStatus } from '../../forms/contract/role.action';
import { useState } from 'react';

export const ToggleRoleStatus = ({ status, org, role }: { status: Database['public']['Enums']['is_open']; org: string; role: string }) => {
	const [state, setState] = useState(status);

	const toggleStatus = async (checked: boolean) => {
		await toggleRoleStatus(checked ? 'open' : 'closed', role, org);
		setState(checked ? 'open' : 'closed');
	};

	return (
		<div className={cn(buttonVariants({ variant: 'secondary' }), 'h-fit gap-2 py-1 text-xs font-light')}>
			{state}
			<Switch defaultChecked={state == 'open'} onCheckedChange={toggleStatus} className="scale-50" />
		</div>
	);
};
