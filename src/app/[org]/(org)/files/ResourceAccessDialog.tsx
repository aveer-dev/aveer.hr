'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { getAllEmployeesByOrgWithProfileAndTeam, getAllTeamsByOrg, getResourceAccessList, grantResourceAccessAction, updateResourceAccessAction, revokeResourceAccessAction } from './file.actions';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ResourceAccessListItem } from '@/dal/interfaces/file-management.types';
import { cn } from '@/lib/utils';
import { CommandGroup, CommandItem, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command';
import { Command } from '@/components/ui/command';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectGroup, SelectSeparator, SelectValue } from '@/components/ui/select';
import { SelectTrigger } from '@/components/ui/select';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageLoader } from '@/components/ui/page-loader';

export function ResourceAccessDialog({ resourceId, resourceType, org, open, setOpen, resourceName }: { resourceId?: number; resourceType: 'file' | 'folder'; org: string; open: boolean; setOpen: (open: boolean) => void; resourceName: string }) {
	const [openPopover, setOpenPopover] = useState(false);
	const [accessList, setAccessList] = useState<ResourceAccessListItem[]>([]);
	const [selected, setSelected] = useState<{ type: 'employee' | 'team'; id: string; label: string }[]>([]);
	const [search, setSearch] = useState('');
	const [employees, setEmployees] = useState<any[]>([]);
	const [teams, setTeams] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [accessLevel, setAccessLevel] = useState('view');

	const accessLevels = ['view', 'edit', 'full'];

	const fetchResourceAccess = async (resourceId: number, resourceType: 'file' | 'folder') => {
		const accessRes = await getResourceAccessList(resourceId, resourceType, '*, profile:profiles!resource_access_profile_fkey(first_name, email, id, last_name), team:teams!resource_access_team_fkey(name, id)');
		return accessRes;
	};

	const dataExists = employees.length > 0 && teams.length > 0;

	// Fetch employees and teams on open
	useEffect(() => {
		if (!open) return;

		if (!resourceId) return;

		if (dataExists) {
			setLoading(true);
			fetchResourceAccess(resourceId, resourceType)
				.then(res => {
					setAccessList(res?.data || []);
				})
				.catch(err => toast.error('Error fetching access list', { description: err.message }))
				.finally(() => {
					setLoading(false);
				});
			return;
		}

		setLoading(true);
		Promise.all([getAllEmployeesByOrgWithProfileAndTeam(org), getAllTeamsByOrg(org), fetchResourceAccess(resourceId, resourceType)]).then(([employeeData, teamData, accessRes]) => {
			setEmployees(employeeData?.data || []);
			setTeams(teamData?.data || []);

			setAccessList(accessRes?.data || []);

			if (employeeData?.error) toast.error('Error fetching employees', { description: employeeData?.error.message });
			if (teamData?.error) toast.error('Error fetching teams', { description: teamData?.error.message });
			if (accessRes?.error) toast.error('Error fetching access list', { description: accessRes?.error.message });

			setLoading(false);
		});
	}, [open, org, resourceId, resourceType, dataExists]);

	// Filtered options for combobox
	const filteredEmployees = employees.filter(e => (e.profile?.first_name + ' ' + e.profile?.last_name).toLowerCase().includes(search.toLowerCase()) && !selected.some(s => s.type === 'employee' && s.id === e.profile.id));
	const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) && !selected.some(s => s.type === 'team' && s.id === t.id));

	// Add selected
	const handleSelect = (item: { type: 'employee' | 'team'; id: string; label: string }) => {
		if (!selected.find(s => s.type === item.type && s.id === item.id)) {
			setSelected([...selected, item]);
		}
		setSearch('');
	};

	// Remove selected
	const handleRemove = (item: { type: 'employee' | 'team'; id: string }) => {
		setSelected(selected.filter(s => !(s.type === item.type && s.id === item.id)));
	};

	// Helper to map UI access level to backend enum
	const mapAccessLevel = (level: string): string => {
		switch (level) {
			case 'view':
				return 'read';
			case 'edit':
				return 'write';
			case 'full':
				return 'full';
			default:
				return 'read';
		}
	};

	// Map access level to UI
	const mapAccessLevelUI = (level: string): string => {
		switch (level) {
			case 'read':
				return 'view';
			case 'write':
				return 'edit';
			case 'full':
				return 'full';
			case 'owner':
				return 'owner';
			default:
				return 'view';
		}
	};

	const grantAccess = async () => {
		if (!resourceId || selected.length === 0) return;
		setLoading(true);

		const employeeIds = selected.filter(s => s.type === 'employee').map(s => s.id);
		const teamIds = selected.filter(s => s.type === 'team').map(s => Number(s.id));

		try {
			const { error } = await grantResourceAccessAction({
				resource_id: resourceId,
				resource_type: resourceType,
				profiles: employeeIds,
				teams: teamIds,
				access_level: mapAccessLevel(accessLevel) as any,
				resourceName: resourceName,
				org: org
			});

			if (error) throw error;
			toast.success('Access granted!');

			// Refresh access list
			const accessRes = await fetchResourceAccess(resourceId, resourceType);
			setAccessList(accessRes?.data || []);
			setSelected([]);
		} catch (error: any) {
			toast.error('Failed to grant access', { description: error?.message });
		} finally {
			setLoading(false);
		}
	};

	const updateAccess = async ({ accessLevel, profile, team }: { accessLevel: string; profile?: string; team?: number }) => {
		if (!resourceId) return;
		setLoading(true);
		try {
			const request = updateResourceAccessAction({
				resourceId: resourceId,
				resourceType: resourceType,
				accessLevel: mapAccessLevel(accessLevel) as any,
				profile,
				team
			});
			toast.promise(request, {
				loading: 'Updating access...',
				success: async response => {
					if (response.error) return response.error.message;

					// Refresh access list
					const accessRes = await fetchResourceAccess(resourceId, resourceType);
					setAccessList(accessRes?.data || []);
					return 'Access updated!';
				},
				error: 'Failed to update access'
			});
		} catch (error: any) {
			toast.error('Failed to update access', { description: error?.message });
		} finally {
			setLoading(false);
		}
	};

	const revokeAccess = async ({ profile, team }: { profile?: string; team?: number }) => {
		if (!resourceId) return;
		setLoading(true);
		try {
			const request = revokeResourceAccessAction({
				resourceId,
				resourceType,
				profile,
				team
			});
			await toast.promise(request, {
				loading: 'Revoking access...',
				success: async response => {
					if (response.error) return response.error.message;
					const accessRes = await fetchResourceAccess(resourceId, resourceType);
					setAccessList(accessRes?.data || []);
					return 'Access revoked!';
				},
				error: 'Failed to revoke access'
			});
		} catch (error: any) {
			toast.error('Failed to revoke access', { description: error?.message });
		} finally {
			setLoading(false);
		}
	};

	const onOpenChange = (state: boolean) => {
		setOpen(state);
		setSelected([]);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Manage Access</AlertDialogTitle>
					<AlertDialogDescription>Add or remove employees and teams who should have access to this {resourceType}.</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="mb-2">
					<Popover open={openPopover} onOpenChange={setOpenPopover}>
						<div className={cn(buttonVariants({ variant: 'outline' }), 'flex h-fit min-h-[44px] flex-col px-0 hover:bg-background')}>
							<PopoverTrigger className={'flex h-fit w-full flex-wrap justify-start gap-2 rounded-md px-3 py-3 outline-none focus:!ring-1 focus:ring-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1'}>
								{selected.length === 0 && <span className="text-muted-foreground">Add people or teams...</span>}
								{selected.map(item =>
									item.type === 'employee' ? (
										<Badge key={item.id} variant="secondary" className="flex w-fit items-center gap-3 border border-border px-2 py-1">
											{item.label}
											<a
												className="rounded-full bg-background p-1 transition-colors"
												onClick={e => {
													e.stopPropagation();
													handleRemove(item);
												}}>
												<X size={12} />
											</a>
										</Badge>
									) : (
										<Badge key={item.id} variant="secondary" className="flex w-fit items-center gap-3 border border-border px-2 py-1">
											{item.label}
											<a
												className="rounded-full bg-background p-1 transition-colors"
												onClick={e => {
													e.stopPropagation();
													handleRemove(item);
												}}>
												<X size={12} />
											</a>
										</Badge>
									)
								)}
							</PopoverTrigger>

							{selected.length > 0 && (
								<>
									<Separator className="mt-1" />

									<div className="flex w-full justify-end p-2">
										<Select value={accessLevel} onValueChange={setAccessLevel}>
											<SelectTrigger className="h-8 w-24 py-1 capitalize">
												<SelectValue placeholder="Select access type" className="capitalize" />
											</SelectTrigger>

											<SelectContent>
												<SelectGroup>
													{accessLevels.map(level => (
														<SelectItem key={level} value={level} className="capitalize">
															{level}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>
								</>
							)}
						</div>

						<PopoverContent
							className="w-80 p-0"
							align="start"
							onWheel={e => {
								e.stopPropagation();
							}}>
							<Command shouldFilter={false} loop>
								<CommandInput placeholder="Search employees or teams..." className="h-9" value={search} onValueChange={setSearch} />
								<CommandList>
									<CommandEmpty>No employees or teams found.</CommandEmpty>

									<CommandGroup heading="People">
										{filteredEmployees.map((e, index) => (
											<CommandItem
												key={e.profile.id + 'employee' + index}
												value={e.profile.id}
												onSelect={() => {
													handleSelect({
														type: 'employee',
														id: e.profile.id,
														label: `${e.profile.first_name} ${e.profile.last_name}`
													});
													setOpenPopover(false);
												}}>
												{e.profile.first_name} {e.profile.last_name}
											</CommandItem>
										))}
									</CommandGroup>

									{filteredTeams.length > 0 && (
										<CommandGroup heading="Teams">
											{filteredTeams.map(t => (
												<CommandItem
													onSelect={() => {
														handleSelect({
															type: 'team',
															id: t.id,
															label: t.name
														});
														setOpenPopover(false);
													}}
													key={t.id}
													value={t.id}>
													{t.name}
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{selected.length > 0 && <Textarea placeholder="Add a message..." className="mb-4" />}

				{selected.length == 0 && (
					<div className="mb-4 mt-2">
						<h3 className="mb-4 text-xs font-medium text-muted-foreground">People with access</h3>

						<ScrollArea className="flex max-h-60 flex-col p-1">
							{accessList.length > 0 && (
								<ul className="space-y-8">
									{accessList.map(a => (
										<li key={(a.profile as any)?.id || (a.team as any)?.id} className="flex items-center justify-between">
											<div className="space-y-2">
												<h4 className="text-sm">
													{a.profile ? `${(a.profile as any).first_name} ${(a.profile as any).last_name}` : (a.team as any).name}
													<Badge variant="secondary" className="ml-1 px-2">
														{a.profile ? 'employee' : 'team'}
													</Badge>
												</h4>
												{a.profile && (
													<p className="space-x-2 text-xs text-muted-foreground">
														<span className="text-muted-foreground">{(a.profile as any).email}</span>
														<span className="text-muted-foreground">•</span>
														<span className="text-muted-foreground">{a.access_level}</span>
													</p>
												)}
											</div>

											<Select
												value={mapAccessLevelUI(a.access_level)}
												disabled={a.access_level === 'owner'}
												onValueChange={val => {
													if (val === 'remove') {
														if (a.profile) {
															revokeAccess({ profile: (a.profile as any).id });
														} else if (a.team) {
															revokeAccess({ team: (a.team as any).id });
														}
														return;
													}

													if (a.profile) {
														updateAccess({ accessLevel: val, profile: (a.profile as any).id });
													} else if (a.team) {
														updateAccess({ accessLevel: val, team: (a.team as any).id });
													}
												}}>
												<SelectTrigger className="h-8 w-24 py-1 capitalize">
													<SelectValue placeholder={mapAccessLevelUI(a.access_level)} className="capitalize" />
												</SelectTrigger>

												<SelectContent>
													<SelectGroup>
														{accessLevels.map(level => (
															<SelectItem key={level} value={level} className="capitalize">
																{level}
															</SelectItem>
														))}
														<SelectItem value="owner" className="capitalize">
															Owner
														</SelectItem>
													</SelectGroup>

													{a.access_level !== 'owner' && (
														<>
															<SelectSeparator />

															<SelectGroup>
																<SelectItem value="remove">Remove</SelectItem>
															</SelectGroup>
														</>
													)}
												</SelectContent>
											</Select>
										</li>
									))}
								</ul>
							)}

							<PageLoader isLoading={loading} />

							{accessList.length === 0 && <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No one has access to this {resourceType}.</p>}
						</ScrollArea>
					</div>
				)}

				<AlertDialogFooter>
					{selected.length > 0 && (
						<Button variant="secondary" onClick={() => onOpenChange(false)} className="px-6">
							Close
						</Button>
					)}

					<Button onClick={() => (selected.length > 0 ? grantAccess() : onOpenChange(false))} className="px-8" disabled={loading}>
						{selected.length > 0 ? 'Send invite' : 'Close'}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
