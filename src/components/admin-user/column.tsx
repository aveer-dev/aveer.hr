'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components//ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Tables } from '@/type/database.types';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../ui/loader';
import { removeAdminPerson } from './admin-actions';

const supabase = createClient();

const BadgeSwitch = ({ row }: any) => {
	const [state, setState] = useState(row.original.disable);

	const onCheckChange = async (state: boolean) => {
		const { data, error } = await supabase.from('profiles_roles').update({ disable: state }).eq('id', row.original.id).select('disable').single();

		if (data) setState(data.disable);
		if (error) toast('😭 Unable to update role', { description: error.message });
	};

	return (
		<Badge className="w-fit gap-2 py-1 font-light" variant="secondary">
			<span className="w-9">Disable</span>
			<Switch checked={state} className="scale-50" onClick={event => event.stopPropagation()} onCheckedChange={onCheckChange} />
		</Badge>
	);
};

const DeleteButton = ({ row }: any) => {
	const [isLoading, setLoadState] = useState(false);
	const router = useRouter();

	const deleteAdmin = async (event: any) => {
		event.stopPropagation();

		setLoadState(true);
		const response = await removeAdminPerson(row.original.id, row.original.organisation);
		setLoadState(false);

		if (typeof response == 'string') return toast('😭 Unable to delete admin user', { description: response });

		toast('Admin user deleted', { description: response });
		router.refresh();
	};

	return (
		<Button disabled={row.original.isUser} onClick={deleteAdmin} variant={'secondary_destructive'} className="h-8">
			{!isLoading && <Trash2 size={12} />}
			{isLoading && <LoadingSpinner className="text-destructive" />}
		</Button>
	);
};

export const adminUserColumn: ColumnDef<Tables<'profiles_roles'> & { profile: Tables<'profiles'>; isUser: boolean }>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary"
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} className="h-5 w-5 border-none bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-primary" onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" />,
		enableSorting: false,
		enableHiding: false,
		size: 50
	},
	{
		id: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return (
				<div className="">
					{row.original.profile.first_name} {row.original.profile.last_name}
				</div>
			);
		}
	},
	{
		id: 'email',
		header: 'Email',
		cell: ({ row }) => {
			return <div className="">{row.original.profile.email}</div>;
		}
	},
	{
		accessorKey: 'role',
		header: 'Role'
	},
	{
		id: 'createdAt',
		header: 'Created At',
		cell: ({ row }) => (
			<div>
				<span>{format(row.original.created_at, 'PP')}</span>
			</div>
		)
		// },
		// {
		// 	id: 'toggle',
		// 	cell: ({ row }) => {
		// 		return <BadgeSwitch row={row} />;
		// 	},
		// 	size: 50
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return <DeleteButton row={row} />;
		},
		size: 50
	}
];
