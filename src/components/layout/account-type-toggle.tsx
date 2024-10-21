'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { Building2, CheckCheck, ChevronDown, ChevronRight, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LINK {
	type: 'admin' | 'employee';
	links: { link: string; label: string; id: string }[];
}

const supabase = createClient();

export const AccountTypeToggle = ({ orgId }: { orgId?: string }) => {
	const [isOpen, toggleOpen] = useState(false);
	const [orgs, setOrgs] = useState<LINK>();
	const [contracts, setContracts] = useState<LINK>();
	const [subLinks, setSubLinks] = useState<LINK>();
	const path = usePathname();

	const getOrgs = useCallback(
		async (profile: string) => {
			const { data, error } = await supabase.from('profiles_roles').select('organisation:organisations!profiles_roles_organisation_fkey(id, name, subdomain)').eq('profile', profile);
			if (error) return toast.error('Unable to fetch organisations', { description: error.message });

			const links: LINK = { type: 'admin', links: data.map(org => ({ id: `${org.organisation?.subdomain as string}`, link: `${process.env.NEXT_PUBLIC_URL || ''}/${org.organisation?.subdomain || ''}`, label: org.organisation?.name as string })) };
			setOrgs(() => links);
			if (orgId !== 'employee') setSubLinks(links);
		},
		[orgId]
	);

	const getContracts = useCallback(
		async (profile: string) => {
			const { data, error } = await supabase.from('contracts').select('id, job_title, org:organisations!contracts_org_fkey(name, subdomain)').eq('profile', profile);
			if (error) return toast.error('Unable to fetch organisations', { description: error.message });

			const links: LINK = { type: 'employee', links: data.map(contract => ({ id: `${contract?.id as number}`, link: `/employee/${contract.org?.subdomain || ''}/${contract.id}/home`, label: `${contract.job_title} - ${contract.org?.name as string}` })) };
			setContracts(() => links);
			if (orgId == 'employee') setSubLinks(links);
		},
		[orgId]
	);

	useEffect(() => {
		supabase.auth.getUser().then(auth => {
			getOrgs(auth.data.user?.id as string);
			getContracts(auth.data.user?.id as string);
		});
	}, [getContracts, getOrgs, orgId]);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpen}>
			<PopoverTrigger asChild>
				<Button variant="secondary" size={'sm'} className="mt-1 h-7 gap-3 rounded-full">
					<span className="hidden sm:block">{orgId && orgId !== 'employee' ? 'Organisation' : 'Employee'}</span>
					<ChevronDown size={12} />
				</Button>
			</PopoverTrigger>

			<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="flex w-full" align="start">
				<div className="w-52 space-y-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Account type</h4>
						<p className="text-xs text-muted-foreground">How will you like to operate your account:</p>
					</div>

					<div className="grid gap-2">
						<Button
							onClick={() => (orgs?.links.length ? setSubLinks(orgs) : toast(`You're not an active admin for any organisation`))}
							onMouseEnter={() => setSubLinks(orgs)}
							variant={subLinks?.type == 'admin' ? 'secondary' : 'ghost'}
							className={cn('justify-between')}>
							<div className="flex items-center gap-4">
								<Building2 size={12} />
								Organisation
							</div>

							{orgId !== 'employee' ? <CheckCheck size={12} /> : <ChevronRight size={12} />}
						</Button>

						<Button
							onClick={() => (contracts?.links.length ? setSubLinks(contracts) : toast(`You're not an active employee for any organisation`))}
							onMouseEnter={() => setSubLinks(contracts)}
							variant={subLinks?.type == 'employee' ? 'secondary' : 'ghost'}
							className={cn('justify-between')}>
							<div className="flex items-center gap-4">
								<UserRound size={12} /> Employee
							</div>

							{orgId == 'employee' ? <CheckCheck size={12} /> : <ChevronRight size={12} />}
						</Button>
					</div>
				</div>

				<div className={cn('max-h-72 w-0 space-y-4 overflow-x-hidden p-px transition-all', subLinks?.links.length && 'w-64')}>
					<ul className="space-y-2">
						{subLinks?.links.map((link, index) => (
							<li key={index}>
								<Link href={link.link} passHref={true} onClick={() => toggleOpen(!isOpen)} className={cn(buttonVariants({ variant: path.includes(link.id) ? 'secondary' : 'ghost' }), 'w-full justify-between')}>
									<div className="flex items-center gap-4">
										<Building2 size={12} />
										<span className="max-w-44 truncate">
											{link.label} {link.label}
										</span>
									</div>

									{path.includes(`/${link.id}`) && <CheckCheck size={12} />}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</PopoverContent>
		</Popover>
	);
};
