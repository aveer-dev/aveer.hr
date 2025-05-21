'use client';
import { useEffect, useState } from 'react';
import { getResourceAccessList } from './file.actions';
import { EmployeeHoverCard } from '@/components/ui/employee-hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ResourceAccessListItem } from '@/dal/interfaces/file-management.types';

interface ResourceAccessListProps {
	resourceId: number;
	resourceType: 'file' | 'folder';
	org: string;
}

export const ResourceAccessList = ({ resourceId, resourceType, org }: ResourceAccessListProps) => {
	const [accessList, setAccessList] = useState<ResourceAccessListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		getResourceAccessList(resourceId, resourceType, '*, profile:profiles!resource_access_profile_fkey(first_name, email, id, last_name), team:teams!resource_access_team_fkey(name, id)')
			.then(res => {
				if (res.error) setError('Failed to load access list');
				else setAccessList(res.data || []);
			})
			.finally(() => setLoading(false));
	}, [resourceId, resourceType, org]);

	if (loading) return <Skeleton className="h-24 w-full" />;
	if (error) return <span className="text-xs text-red-500">{error}</span>;
	if (!accessList.length) return <span className="text-xs text-muted-foreground">No access granted</span>;

	return (
		<ul className="flex flex-wrap items-center gap-2 text-xs">
			{accessList.map(item => (
				<li key={item.profile} className="flex items-center gap-1">
					<Badge variant="secondary" className="flex items-center gap-1 p-2">
						{!!item.profile && <EmployeeHoverCard employeeId={(item.profile as any)?.id} profile={item.profile as any} org={org} contentClassName="text-xs" triggerClassName="cursor-pointer" />}
						{!!item.team && (item.team as any).name}
						{!!item.team && <span className="ml-2 text-muted-foreground">(team)</span>}
						<span className="text-muted-foreground">({item.access_level})</span>
					</Badge>
				</li>
			))}
		</ul>
	);
};
