'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { useEmployeeProfileTeam } from '@/hooks';
import { Skeleton } from './skeleton';
import { Separator } from './separator';
import { Tables } from '@/type/database.types';
import { Fragment } from 'react';

export const EmployeeHoverCard = ({ employeeId, org, triggerClassName, contentClassName, profile }: { employeeId: string; org: string; triggerClassName?: string; contentClassName?: string; profile?: Tables<'profiles'> }) => {
	const { data, error, loading } = useEmployeeProfileTeam(employeeId, org);

	if (loading && !profile) {
		return <Skeleton className="inline h-[16.5px] w-28" />;
	}

	if (loading && !profile) {
		return <Skeleton className="inline h-[16.5px] w-28" />;
	}

	if (!loading && (error || !data || data.length === 0)) {
		return <div>Error loading employee profile. {error}</div>;
	}

	return (
		<HoverCard>
			<HoverCardTrigger className={cn('underline decoration-dotted underline-offset-2', triggerClassName)}>
				{data?.[0]?.profile?.first_name || profile?.first_name} {data?.[0]?.profile?.last_name || profile?.last_name}
			</HoverCardTrigger>

			<HoverCardContent className={cn('p-3', contentClassName)} side="bottom" align="start" onClick={event => event.preventDefault()}>
				<div className="flex flex-col gap-0.5">
					<p className="text-xs font-medium">
						{data?.[0]?.profile?.first_name || profile?.first_name} {data?.[0]?.profile?.last_name || profile?.last_name}
					</p>
					<p className="text-xs text-muted-foreground">{data?.[0]?.profile?.email || profile?.email}</p>
				</div>

				{data?.[0]?.job_title && <Separator className="my-2" />}

				{data &&
					data?.map(employee => {
						if (!employee.job_title) return null;

						return (
							<Fragment key={employee.id}>
								<ul className="flex flex-col gap-2" key={employee.id}>
									<li className="flex items-center gap-2">
										<div className="text-xs font-medium">Role</div>
										<div className="text-xs text-muted-foreground">{employee.job_title}</div>
									</li>

									{employee.team && (
										<li className="flex items-center gap-2">
											<div className="text-xs font-medium">Team</div>
											<div className="text-xs text-muted-foreground">{employee.team?.name}</div>
										</li>
									)}
								</ul>

								{employee !== data[data.length - 1] && <Separator className="my-2" />}
							</Fragment>
						);
					})}
			</HoverCardContent>
		</HoverCard>
	);
};
