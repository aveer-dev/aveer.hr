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
import { useMediaQuery } from 'usehooks-ts';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';

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

	const isDesktop = useMediaQuery('(min-width: 768px)');
	const path = usePathname();

	const getOrgs = useCallback(
		async (profile: string) => {
			const { data, error } = await supabase.from('profiles_roles').select('organisation:organisations!profiles_roles_organisation_fkey(id, name, subdomain)').match({ profile, disable: false });
			if (error) return toast.error('Unable to fetch organisations', { description: error.message });

			const links: LINK = {
				type: 'admin',
				links: data.map(org => ({
					id: `${org.organisation?.subdomain}`,
					link: process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? `http://${org.organisation?.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN}/` : `/${org.organisation?.subdomain}`,
					label: org.organisation?.name as string
				}))
			};
			setOrgs(() => links);
			if (orgId !== 'employee') setSubLinks(links);
		},
		[orgId]
	);

	const getContracts = useCallback(
		async (profile: string) => {
			const { data, error } = await supabase.from('contracts').select('id, job_title, org:organisations!contracts_org_fkey(name, subdomain)').eq('profile', profile);
			if (error) return toast.error('Unable to fetch organisations', { description: error.message });

			const links: LINK = { type: 'employee', links: data.map(contract => ({ id: `${contract?.id}`, link: `/employee/${contract.org?.subdomain || ''}/${contract.id}/home`, label: `${contract.job_title} - ${contract.org?.name as string}` })) };
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

	const Content = () => {
		return (
			<>
				<div className="space-y-4 border-r p-4 sm:w-52 sm:p-1">
					<div className="space-y-2">
						<h4 className="text-sm font-medium leading-none">Account type</h4>
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

				<Separator className="block sm:hidden" />

				<div className={cn('w-0 space-y-4 p-4 transition-all sm:overflow-x-hidden sm:p-1', subLinks?.links.length && 'w-full sm:w-64')}>
					<ul className="space-y-2">
						{subLinks?.links.map((link, index) => (
							<li key={index}>
								<Link href={link.link} passHref={true} onClick={() => toggleOpen(!isOpen)} className={cn(buttonVariants({ variant: path.includes(link.id) ? 'secondary' : 'ghost' }), 'w-full justify-between')}>
									<div className="flex items-center gap-4">
										<Building2 size={12} />
										<span className="max-w-44 truncate">{link.label}</span>
									</div>

									{(subLinks.type == 'admin' ? path.includes(`/${link.id}`) && orgId !== 'employee' : path.includes(`/${link.id}`) && orgId == 'employee') && <CheckCheck size={12} />}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</>
		);
	};

	if (!isDesktop)
		return (
			<Drawer open={isOpen} onOpenChange={toggleOpen}>
				<DrawerTrigger asChild>
					<Button variant="secondary" size={'sm'} className="mt-1 h-7 w-7 gap-3 rounded-full p-0 sm:w-fit sm:p-3">
						<span className="hidden sm:block">{orgId && orgId !== 'employee' ? 'Organisation' : 'Employee'}</span>
						<ChevronDown size={12} />
					</Button>
				</DrawerTrigger>

				<DrawerContent>
					<DrawerHeader className="text-left">
						<DrawerTitle>Account type</DrawerTitle>
						<DrawerDescription>Make changes to your profile here. Click save when you&apos;re done.</DrawerDescription>
					</DrawerHeader>

					<Content />
				</DrawerContent>
			</Drawer>
		);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpen}>
			<PopoverTrigger asChild>
				<Button variant="secondary" size={'sm'} className="mt-1 h-7 w-7 gap-3 rounded-full p-0 sm:w-fit sm:p-3">
					<span className="hidden sm:block">{orgId && orgId !== 'employee' ? 'Organisation' : 'Employee'}</span>
					<ChevronDown size={12} />
				</Button>
			</PopoverTrigger>

			<PopoverContent onOpenAutoFocus={event => event.preventDefault()} className="flex w-full" align="start">
				<Content />
			</PopoverContent>
		</Popover>
	);
};
