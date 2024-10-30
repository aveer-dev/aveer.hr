'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon, CircleX, Check } from 'lucide-react';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PERSON } from '@/type/person';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Database, Tables } from '@/type/database.types';

interface props {
	toggleTableLoadingState: Dispatch<SetStateAction<boolean>>;
	updateData: Dispatch<SetStateAction<PERSON[]>>;
	org: string;
}
type CONTRACT_TYPE = Database['public']['Enums']['contract_state'] | string;

const supabase = createClient();

export const DashboardFilters = ({ toggleTableLoadingState, updateData, org }: props) => {
	const [showTeamFilter, toggleTeamFilter] = useState(false);
	const [showStatusFilter, toggleStatusFilter] = useState(false);
	const [showEmploymentTypeFilter, toggleEmploymentTypeFilter] = useState(false);
	const [showCountryFilter, toggleCountryFilter] = useState(false);
	const [isCountriesOpen, toggleCountryOpenState] = useState(true);
	const [countries, setCountries] = useState<{ name: string; dial_code: string; country_code: string }[]>([]);
	const [teams, setTeams] = useState<Tables<'teams'>[]>([]);
	const [countryFilterValue, setCountryFilterValue] = useState('');
	const [employmentTypeFilterValue, setEmploymentTypeFilterValue] = useState('');

	const [statusFilterValue, setStausFilterValue] = useState<CONTRACT_TYPE>();
	const [teamFilterValue, setTeamFilterValue] = useState<CONTRACT_TYPE>();

	const getCountries = async () => {
		const { data, error } = await supabase.from('countries').select();
		if (!error) setCountries(data || []);
	};

	const getTeams = useCallback(async () => {
		const { data, error } = await supabase.from('teams').select().eq('org', org);
		if (!error) setTeams(data || []);
	}, [org]);

	const getContractsWithFilter = useCallback(
		async ({ status, employment_type, nationality, team }: { status?: CONTRACT_TYPE; employment_type?: string; nationality?: string; team?: string }) => {
			toggleTableLoadingState(true);

			let query = supabase.from('contracts').select(`
            id,
            status,
            job_title,
            employment_type,
            start_date,
            org, team:teams!contracts_team_fkey(name, id),
            profile:profiles!contracts_profile_fkey(
                first_name,
                last_name,
                nationality:countries!profiles_nationality_fkey(
                    name,
                    country_code
                )
            )
        `);
			if (nationality) query = query.not('profile', 'is', null).not('profile.nationality', 'is', null).eq('profile.nationality.country_code', nationality);
			if (status) query = query.eq('status', status);
			if (employment_type) query = query.eq('employment_type', employment_type);
			if (team) query = query.eq('team', team);

			const { data, error } = await query.eq('org', org).order('id');
			toggleTableLoadingState(false);
			if (error) toast.error(error.message);
			updateData(data as any);
		},
		[toggleTableLoadingState, updateData, org]
	);

	useEffect(() => {
		getTeams();
		getCountries();
	}, [getTeams]);

	const statusOptions = [
		{ label: 'Awaiting signatures', value: 'awaiting signatures' },
		{ label: 'Awaiting org signature', value: 'awaiting org signature' },
		{ label: 'Awaiting employee signature', value: 'awaiting signature' },
		{ label: 'Signed', value: 'signed' },
		{ label: 'Inactive', value: 'inactive' },
		{ label: 'Terminated', value: 'terminated' },
		{ label: 'Scheduled termination', value: 'scheduled termination' }
	];

	return (
		<div className="flex gap-3">
			{showStatusFilter && (
				<Select
					defaultOpen
					onValueChange={value => {
						setStausFilterValue(value as any);
						getContractsWithFilter({ status: value, employment_type: employmentTypeFilterValue, nationality: countryFilterValue });
					}}>
					<div className="relative">
						<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
							<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
								<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Status</div>
								<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2', !statusFilterValue && 'text-muted-foreground')}>
									<SelectValue placeholder="Select a status" />
									<div className="h-3 w-3"></div>
								</div>
							</div>
						</SelectTrigger>
						{statusFilterValue && (
							<button
								className="absolute right-3 top-1/2 -translate-y-1/2"
								onClick={() => {
									setStausFilterValue('');
									getContractsWithFilter({ status: '', employment_type: employmentTypeFilterValue, nationality: countryFilterValue });
									toggleStatusFilter(false);
								}}>
								<CircleX size={14} className="stroke-1" />
							</button>
						)}
					</div>
					<SelectContent>
						<SelectGroup>
							{statusOptions.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			)}

			{showTeamFilter && (
				<Select
					defaultOpen
					onValueChange={value => {
						setTeamFilterValue(value as any);
						getContractsWithFilter({ status: statusFilterValue, employment_type: employmentTypeFilterValue, nationality: countryFilterValue, team: value });
					}}>
					<div className="relative">
						<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
							<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
								<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Team</div>
								<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2', !teamFilterValue && 'text-muted-foreground')}>
									<SelectValue placeholder="Select a status" />
									<div className="h-3 w-3"></div>
								</div>
							</div>
						</SelectTrigger>
						{teamFilterValue && (
							<button
								className="absolute right-3 top-1/2 -translate-y-1/2"
								onClick={() => {
									setTeamFilterValue('');
									getContractsWithFilter({ status: statusFilterValue, employment_type: employmentTypeFilterValue, nationality: countryFilterValue, team: '' });
									toggleTeamFilter(false);
								}}>
								<CircleX size={14} className="stroke-1" />
							</button>
						)}
					</div>
					<SelectContent>
						<SelectGroup>
							{teams.map(team => (
								<SelectItem key={team.id} value={String(team.id)}>
									{team.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			)}

			{showEmploymentTypeFilter && (
				<Select
					defaultOpen
					onValueChange={value => {
						setEmploymentTypeFilterValue(value);
						getContractsWithFilter({ status: statusFilterValue, employment_type: value, nationality: countryFilterValue });
					}}>
					<div className="relative">
						<SelectTrigger className="h-[unset] w-fit rounded-full border-none bg-transparent p-0 [&_>_svg]:hidden">
							<div className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
								<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Employment type</div>
								<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2', !employmentTypeFilterValue && 'text-muted-foreground')}>
									<SelectValue placeholder="Select a type" />
									<div className="h-3 w-3"></div>
								</div>
							</div>
						</SelectTrigger>
						{employmentTypeFilterValue && (
							<button
								className="absolute right-3 top-1/2 -translate-y-1/2"
								onClick={() => {
									setEmploymentTypeFilterValue('');
									getContractsWithFilter({ status: statusFilterValue, employment_type: '', nationality: countryFilterValue });
									toggleEmploymentTypeFilter(false);
								}}>
								<CircleX size={14} className="stroke-1" />
							</button>
						)}
					</div>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="full-time">Full-time</SelectItem>
							<SelectItem value="part-time">Part-time</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			)}

			{showCountryFilter && (
				<Popover open={isCountriesOpen}>
					<div className="relative">
						<PopoverTrigger asChild>
							<Button onClick={() => toggleCountryOpenState(true)} className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 bg-transparent p-0 font-light hover:bg-transparent')}>
								<div className="rounded-full rounded-e-none bg-secondary px-3 py-2">Country</div>
								<div className={cn('flex items-center gap-3 rounded-full rounded-s-none bg-secondary px-3 py-2', !countryFilterValue && 'text-muted-foreground')}>
									{countryFilterValue ? countries.find(country => country.country_code === countryFilterValue)?.name : 'Select country filter'}
									<div className="h-3 w-3"></div>
								</div>
							</Button>
						</PopoverTrigger>

						{countryFilterValue && (
							<button
								className="absolute right-3 top-1/2 -translate-y-1/2"
								onClick={() => {
									setCountryFilterValue('');
									getContractsWithFilter({ status: statusFilterValue, employment_type: employmentTypeFilterValue, nationality: '' });
									toggleCountryFilter(false);
								}}>
								<CircleX size={14} className="stroke-1" />
							</button>
						)}
					</div>
					<PopoverContent className="w-full p-0">
						<Command>
							<CommandInput placeholder="Search countries..." />
							<CommandList>
								<CommandEmpty>Country not found</CommandEmpty>
								<CommandGroup>
									{countries.map(country => (
										<CommandItem
											value={country?.name}
											key={country.country_code}
											onSelect={() => {
												setCountryFilterValue(country.country_code);
												getContractsWithFilter({ status: statusFilterValue, employment_type: employmentTypeFilterValue, nationality: country.country_code });
												toggleCountryOpenState(false);
											}}>
											<Check className={cn('mr-2 h-4 w-4', country.country_code === countryFilterValue ? 'opacity-100' : 'opacity-0')} />
											{country?.name}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}

			{(!showStatusFilter || !showEmploymentTypeFilter || !showCountryFilter || !showTeamFilter) && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={'secondary'} className={cn(badgeVariants({ variant: 'secondary' }), 'flex h-fit gap-1 rounded-full bg-secondary p-0 px-3 py-2 font-light')}>
							<PlusIcon size={12} />
							{!showStatusFilter && !showEmploymentTypeFilter && !showCountryFilter && <span>Add Filter</span>}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-52 rounded-lg" align={'start'} sideOffset={2}>
						{!showStatusFilter && (
							<DropdownMenuItem>
								<Button className="h-5 w-full justify-start" onClick={() => toggleStatusFilter(true)} variant={'ghost'} size={'sm'}>
									Status
								</Button>
							</DropdownMenuItem>
						)}
						{!showEmploymentTypeFilter && (
							<DropdownMenuItem>
								<Button className="h-5 w-full justify-start" onClick={() => toggleEmploymentTypeFilter(true)} variant={'ghost'} size={'sm'}>
									Employment type
								</Button>
							</DropdownMenuItem>
						)}
						{!showCountryFilter && (
							<DropdownMenuItem>
								<Button className="h-5 w-full justify-start" onClick={() => toggleCountryFilter(true)} variant={'ghost'} size={'sm'}>
									Country
								</Button>
							</DropdownMenuItem>
						)}
						{!showTeamFilter && (
							<DropdownMenuItem>
								<Button className="h-5 w-full justify-start" onClick={() => toggleTeamFilter(true)} variant={'ghost'} size={'sm'}>
									Team
								</Button>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
};
