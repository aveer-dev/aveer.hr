'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { ArrowUpRight, CalendarRange, Mail, PanelRightOpenIcon, Phone, X } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UpdateApplication } from './applicant-actions';
import { useRouter } from 'next/navigation';
import React from 'react';
import { NavLink } from '@/components/ui/link';
import { APPLICANT, DOCUMENT, LEVEL } from '@/type/roles.types';
import { ApplicantDocuments } from './applicant-documents';
import { LevelsAction } from './level-actions';
import { ROLE } from '@/type/contract.types';
import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { toast } from 'sonner';

interface props {
	data: Tables<'job_applications'> & { org: { name: string; subdomain: string }; role: Tables<'open_roles'> & { policy: Tables<'approval_policies'> }; levels: LEVEL[] };
	onUpdate?: () => void;
	children?: ReactNode;
	className?: string;
	userRole: ROLE;
	contractId?: number;
}

const supabase = createClient();

export const ApplicantDetails = ({ data, onUpdate, children, className, userRole, contractId }: props) => {
	const [applicantData, setApplicantData] = useState<APPLICANT>(data);
	const [role] = useState(userRole);
	const [levels, updateLevels] = useState<LEVEL[]>(applicantData.levels);
	const [isDetailOpen, setDetailState] = useState(false);
	const [documents, setDocuments] = useState<DOCUMENT[]>([]);
	const router = useRouter();

	const getPeopleInLevels = useCallback(async (profileId: string) => {
		const { data, error } = await supabase.from('contracts').select('profile:profiles!contracts_profile_fkey(first_name, last_name)').eq('id', profileId).single();
		if (error) return;

		return data.profile;
	}, []);

	const processLevels = useCallback(
		async (dataLevels: LEVEL[]) => {
			const newLevels: any = [];
			for (let i = 0; i < dataLevels.length; i++) {
				const level = dataLevels[i];

				if (level?.id) {
					const details = await getPeopleInLevels(level?.id);
					newLevels.push({ ...level, ...details, is_employee: role != 'admin' && level.id == (contractId ? String(contractId) : '') });
				} else {
					newLevels.push({ ...level, enabled: level.type == role, is_employee: role != 'admin' && level.id == (contractId ? String(contractId) : '') });
				}
			}

			updateLevels(() => newLevels);
		},
		[contractId, getPeopleInLevels, role]
	);

	useEffect(() => {
		if (isDetailOpen && applicantData.levels) processLevels(applicantData.levels);
	}, [applicantData, processLevels, isDetailOpen, userRole, role]);

	const onClose = (isClose: boolean) => {
		if (isClose == false) data.stage !== applicantData.stage || data.levels !== applicantData.levels ? onUpdate && onUpdate() : router.refresh();
	};

	const onSetDocuments = useCallback((documents: DOCUMENT[]) => {
		setDocuments(documents);
	}, []);

	return (
		<Sheet
			onOpenChange={state => {
				onClose(state);
				setDetailState(state);
			}}>
			<SheetTrigger asChild>
				<button className={cn('gap-3', !children && buttonVariants({ variant: 'secondary' }), className)}>
					{!children && (
						<>
							Review
							<PanelRightOpenIcon size={14} className="text-muted-foreground" />
						</>
					)}

					{!!children && children}
				</button>
			</SheetTrigger>

			<SheetContent hideClose className="overflow-y-auto p-0 sm:w-full sm:max-w-full">
				<SheetHeader className="relative rounded-md bg-accent/70 p-6 text-left">
					<div className="flex flex-col justify-between gap-y-6 sm:flex-row">
						<div className="flex items-center gap-1">
							<SheetTitle className="max-w-64 truncate text-xl">
								<span className="font-light">Role:</span> {applicantData?.role?.job_title}{' '}
							</SheetTitle>
							<SheetDescription></SheetDescription>
						</div>

						<div className="flex gap-2">
							<NavLink target="_blank" org={applicantData.org.subdomain} href={`/jobs/${applicantData.role?.id}`} className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
								Open role
								<ArrowUpRight className="" size={12} />
							</NavLink>

							<SheetClose asChild>
								<Button className="absolute right-2 top-4 order-4 h-9 w-9 rounded-full sm:static" variant={'outline'} size={'icon'}>
									<X size={14} />
								</Button>
							</SheetClose>
						</div>
					</div>
				</SheetHeader>

				<section className="mx-auto mt-3 w-full max-w-2xl p-6">
					<div className="mb-10 space-y-2">
						<h1 className="text-3xl font-bold">
							{applicantData?.first_name} {applicantData?.last_name}
						</h1>

						<div>
							<a href={`mailto:${applicantData?.email}`} className="flex w-fit items-center gap-1 text-sm font-light underline decoration-muted-foreground decoration-dashed underline-offset-4">
								<span className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap">{applicantData?.email}</span>
								<Mail size={12} className="text-muted-foreground" />
							</a>

							<a href={`tel:${applicantData?.phone_number}`} className="flex w-fit items-center gap-1 text-sm font-light underline decoration-muted-foreground decoration-dashed underline-offset-4">
								<span className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap">{applicantData?.phone_number}</span>
								<Phone size={12} className="text-muted-foreground" />
							</a>
						</div>
					</div>

					<Tabs defaultValue={applicantData.levels?.length > 0 ? 'overview' : 'details'}>
						<TabsList className="mb-10 grid w-fit" style={{ gridTemplateColumns: `repeat(${documents.length + 1 + (applicantData.levels?.length ? 1 : 0)}, minmax(0, 1fr))` }}>
							{applicantData.levels?.length > 0 && (
								<TabsTrigger className="capitalize" value="overview">
									Overview
								</TabsTrigger>
							)}

							<TabsTrigger className="capitalize" value="details">
								Details
							</TabsTrigger>

							{documents.length > 0 &&
								documents.map((document, index) => (
									<TabsTrigger key={index} className="capitalize" value={document.name}>
										{document.name}
									</TabsTrigger>
								))}
						</TabsList>

						<TabsContent value="overview">
							<ul className="space-y-16">{levels?.map((level, index) => <LevelsAction key={index} level={level} index={index} role={role} levels={levels} contractId={contractId} applicantData={applicantData} setApplicantData={setApplicantData} />)}</ul>
						</TabsContent>

						<TabsContent value="details">
							<div className="grid w-full gap-16">
								<div>
									<h1 className="mb-4 text-base font-semibold">Location Details</h1>
									<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
										<li className="grid gap-3">
											<p className="text-sm font-medium">Country</p>
											<p className="text-sm font-light capitalize">{(applicantData?.country_location as any)?.name}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">State / City / Province</p>
											<p className="text-sm font-light">{applicantData?.state_location}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Work authorization</p>
											<p className="text-sm font-light">{(applicantData?.country_location as any)?.name}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Requires sponsorship</p>
											<p className="text-sm font-light">{applicantData?.require_sponsorship ? 'Yes' : 'No'}</p>
										</li>
									</ul>
								</div>

								<div>
									<h1 className="mb-4 text-base font-semibold">Links</h1>
									<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
										{(applicantData?.links as any[])?.map(link => (
											<li key={link.name} className="grid gap-3">
												<p className="text-sm font-medium capitalize">{link.name}</p>
												<Link target="_blank" referrerPolicy="no-referrer" href={link.link} className="flex w-fit items-center gap-2 rounded-md bg-secondary p-1 text-sm font-light">
													<span className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap">{link.link}</span>
													<ArrowUpRight size={14} className="rounded-sm bg-background" />
												</Link>
											</li>
										))}
									</ul>
								</div>

								{applicantData?.custom_answers && applicantData?.custom_answers?.length > 0 && (
									<div>
										<h1 className="mb-4 text-base font-semibold">Custom Questions</h1>
										<ul className="grid items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
											{(applicantData?.custom_answers as any[]).map(answer => (
												<li key={answer.name} className="grid gap-3">
													<h3 className="text-sm font-medium capitalize">{answer.name}</h3>
													<p className="text-sm font-light capitalize">{answer.answer}</p>
												</li>
											))}
										</ul>
									</div>
								)}

								<div>
									<h1 className="mb-4 text-base font-semibold">Voluntary Self-Identification</h1>
									<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
										<li className="grid gap-3">
											<h3 className="text-sm font-medium">Gender</h3>
											<p className="text-sm font-light capitalize">{applicantData.gender}</p>
										</li>
										<li className="grid gap-3">
											<h3 className="text-sm font-medium">Race / Ethnicity</h3>
											<p className="text-sm font-light capitalize">{applicantData.race_ethnicity?.replaceAll('-', ' ')}</p>
										</li>
										<li className="grid gap-3">
											<h3 className="text-sm font-medium">Veterian Status</h3>
											<p className="text-sm font-light capitalize">{applicantData.veterian_status}</p>
										</li>
										<li className="grid gap-3">
											<h3 className="text-sm font-medium">Disability status</h3>
											<p className="text-sm font-light capitalize">{applicantData.disability}</p>
										</li>
									</ul>
								</div>
							</div>
						</TabsContent>

						<ApplicantDocuments applicantData={applicantData} setDocuments={onSetDocuments} documents={documents} />
					</Tabs>
				</section>
			</SheetContent>
		</Sheet>
	);
};
