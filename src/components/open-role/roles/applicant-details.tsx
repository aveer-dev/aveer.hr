'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tables, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { ArrowUpRight, CalendarRange, ChevronLeft, ChevronRight, CloudDownload, Mail, MessageSquareReply, PanelRightOpenIcon, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UpdateApplication } from './applicant-actions';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { updateApplication } from './application.action';
import { LoadingSpinner } from '@/components/ui/loader';
import { ComposeMailDialog } from '@/components/ui/mail-dialog';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface LEVEL {
	action?: string;
	id: string;
	level: number;
	type: string;
	first_name?: string;
	last_name?: string;
	created_at?: Date;
	feedback?: string;
}
interface props {
	data: Tables<'job_applications'> & { org: { name: string; subdomain: string }; role: Tables<'open_roles'> & { policy: Tables<'approval_policies'> }; levels: LEVEL[] };
	onUpdate: () => void;
}

interface DOCUMENT {
	name: string;
	url?: string;
	text?: string;
	format?: string;
}

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/'
};

const supabase = createClient();
const resizeObserverOptions = {};
const maxWidth = 420;

export const ApplicantDetails = ({ data, onUpdate }: props) => {
	const [numberOfPages, setNumberOfPages] = useState<number>(0);
	const [activePageNumber, setActivePageNumber] = useState<number>(1);
	const [applicantData, setApplicantData] = useState<Tables<'job_applications'> & { org: { name: string; subdomain: string }; role: Tables<'open_roles'> & { policy: Tables<'approval_policies'> }; levels: LEVEL[] }>(data);
	const [accordionValue, setAccordionValue] = useState('details');
	const [role, setRole] = useState<'admin' | 'manager'>('admin');
	const [userId, setUserId] = useState<string>();
	const [levels, updateLevels] = useState<LEVEL[]>(applicantData.levels);
	const [feedback, setFeedback] = useState('');
	const [isSubmiting, setSubmitState] = useState({ reject: false, approve: false });
	const [isDetailOpen, setDetailState] = useState(false);
	const [showFeedback, setFeedbackState] = useState(false);

	const [documents, setDocuments] = useState<DOCUMENT[]>([]);
	const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>();
	const router = useRouter();

	const getUserId = useCallback(async () => {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (error) return router.push('/login');
		setUserId(() => user?.id);

		return user?.id;
	}, [router]);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
		setNumberOfPages(numPages);
	};

	const onResize = useCallback<ResizeObserverCallback>(entries => {
		const [entry] = entries;

		if (entry) {
			setContainerWidth(entry.contentRect.width);
		}
	}, []);

	const gatherDocuments = useCallback(() => {
		const allDocuments: DOCUMENT[] = [];

		const resumeWithURL = applicantData.documents.find((doc: any) => doc.name == 'resume');
		if (!resumeWithURL && applicantData.resume) allDocuments.push({ name: 'resume', text: applicantData.resume });

		const textCoverLetter = applicantData.documents.find((doc: any) => doc.name == 'cover letter');
		if (!textCoverLetter && applicantData.cover_letter) allDocuments.push({ name: 'cover letter', text: applicantData.cover_letter });

		const getDocumentLink = (url: string) => {
			const { data } = supabase.storage.from('job-applications').getPublicUrl(url);
			const breakDownString = data.publicUrl.split('.');
			return { url: data.publicUrl, format: breakDownString[breakDownString.length - 1] };
		};

		if (applicantData.documents.length) {
			applicantData.documents.forEach((doc: any) => {
				const docData = getDocumentLink(doc.path);
				allDocuments.push({ ...docData, name: doc.name });
				setDocuments(allDocuments);
			});
		} else {
			setDocuments(allDocuments);
		}
	}, [applicantData]);

	const getPeopleInLevels = useCallback(async (profileId: string) => {
		const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', profileId).single();
		if (error) return;

		return data;
	}, []);

	const getManagerStatus = async (team: number, org: string, profile: string) => {
		const { data, error } = await supabase.from('managers').select('id').match({ team, org, profile });
		if (error) return toast.error('Unable to check manager status', { description: error.message });
		if (data && data.length) setRole('manager');
	};

	const processLevels = useCallback(
		async (dataLevels: any[]) => {
			const newLevels: any = [];
			for (let i = 0; i < dataLevels.length; i++) {
				const level = dataLevels[i];

				if (level?.action) {
					const details = await getPeopleInLevels(level?.id);
					newLevels.push({ ...level, ...details });
				} else {
					newLevels.push({ ...level, enabled: level.type == role });
				}
			}

			updateLevels(() => newLevels);
		},
		[getPeopleInLevels, role]
	);

	useEffect(() => {
		gatherDocuments();

		if (isDetailOpen) {
			getUserId().then(async userId => {
				console.log('🚀 ~ getUserId ~ userId:', userId);
				if (applicantData.role?.team && applicantData.org && userId) await getManagerStatus(applicantData.role.team, applicantData.org, userId);
				if (applicantData.levels) processLevels(applicantData.levels);
			});
		}
	}, [applicantData, gatherDocuments, getUserId, processLevels, userId, isDetailOpen]);

	useResizeObserver(containerRef, resizeObserverOptions, onResize);

	const onClose = (isClose: boolean) => isClose == false && (data.stage !== applicantData.stage || data.levels !== applicantData.levels) && onUpdate();

	const onUpdateApplication = async (id: number, payload: TablesUpdate<'job_applications'>) => {
		const response = await updateApplication(id, payload, applicantData.org.subdomain);
		if (typeof response == 'string') return toast.error('Error updating application', { description: response });
		setApplicantData(() => response as any);
	};

	const submitFeedback = async (level: LEVEL, action: string, index: number) => {
		if (!feedback) return;
		setSubmitState({ ...isSubmiting, [action]: true });

		const newLevels = (applicantData.levels as unknown as LEVEL[]).map(lv => {
			const item: LEVEL = { id: lv.id, level: lv.level, type: lv.type };
			lv.action && (item.action = lv.action);
			lv.created_at && (item.created_at = lv.created_at);
			lv.feedback && (item.feedback = lv.feedback);
			return item;
		});

		const newLevel: LEVEL = { id: userId as string, level: level.level, type: level.type, action, feedback, created_at: new Date() };
		newLevels[index] = newLevel;
		await onUpdateApplication(applicantData.id, { levels: newLevels as any });
		setSubmitState({ ...isSubmiting, [action]: false });
	};

	return (
		<Sheet
			onOpenChange={state => {
				onClose(state);
				setDetailState(state);
			}}>
			<SheetTrigger asChild>
				<Button variant={'secondary'} className="gap-3">
					Review
					<PanelRightOpenIcon size={14} className="text-muted-foreground" />
				</Button>
			</SheetTrigger>

			<SheetContent hideClose className="overflow-y-auto p-0 sm:max-w-2xl">
				<SheetHeader className="flex-col justify-between gap-y-6 rounded-md bg-accent/70 p-6 text-left sm:flex-row">
					<div className="space-y-1">
						<SheetTitle className="text-xl">
							{applicantData?.first_name} {applicantData?.last_name}
						</SheetTitle>
						<SheetDescription>{applicantData?.email} </SheetDescription>
					</div>

					<div className="flex gap-2">
						<UpdateApplication className="w-full sm:w-[200px]" levels={applicantData.role.policy?.levels} stage={applicantData.stage} onUpdateItem={data => setApplicantData(data as any)} id={applicantData.id} org={(applicantData.org as any).subdomain} />

						<SheetClose asChild>
							<Button className="absolute right-2 top-4 h-9 w-9 rounded-full sm:static" variant={'outline'} size={'icon'}>
								<X size={14} />
							</Button>
						</SheetClose>
					</div>
				</SheetHeader>

				<section className="mt-3 w-full p-6">
					<Tabs defaultValue={applicantData.levels.length > 0 ? 'overview' : 'details'}>
						<TabsList className="mb-6 grid w-fit" style={{ gridTemplateColumns: `repeat(${documents.length + 1 + (applicantData.levels.length ? 1 : 0)}, minmax(0, 1fr))` }}>
							{applicantData.levels.length > 0 && (
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
							<ul className="space-y-16">
								{levels.map((level, index) => (
									<React.Fragment key={index}>
										{((levels[index - 1] && !levels[index - 1].action) || (!level.action && level.type != role)) && (
											<li className="relative flex w-full gap-4">
												<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
												<div className="w-full space-y-2">
													<h3 className="text-sm capitalize">{level.type}</h3>
													<p className="text-xs text-muted-foreground">Pending review</p>
												</div>
												{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
											</li>
										)}

										{!level.action && level.type == role && (
											<li className="relative flex w-full gap-4">
												<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
												<div className="w-full space-y-2">
													<div className="flex flex-col justify-between gap-y-4">
														<h3 className="text-sm capitalize">{level.type}</h3>

														{!showFeedback && (
															<div className="space-y-4">
																<Button className="w-full gap-2 py-5 sm:max-w-80 sm:justify-start" variant={'outline'}>
																	<CalendarRange size={12} /> Interview
																</Button>

																<ComposeMailDialog
																	title={`Send message to ${applicantData.first_name}`}
																	onClose={state => state == 'success' && toast.success(`Message sent to ${applicantData.first_name}`)}
																	recipients={[applicantData.email]}
																	name={`Message from ${applicantData.org}`}>
																	<Button className="w-full gap-2 py-5 sm:max-w-80 sm:justify-start" variant={'outline'}>
																		<Mail size={12} /> Message
																	</Button>
																</ComposeMailDialog>
																<Button onClick={() => setFeedbackState(!showFeedback)} className="w-full gap-2 py-5 sm:max-w-80 sm:justify-start" variant={'outline'}>
																	<MessageSquareReply size={12} /> Give feedback
																</Button>
															</div>
														)}
													</div>

													{showFeedback && (
														<form className="w-full space-y-2" onSubmit={event => event.preventDefault()}>
															<Label htmlFor="feedback">Feedback</Label>
															<Textarea onChange={event => setFeedback(event.target.value)} defaultValue={feedback} required className="w-full" id="feedback" name="feedback" />
															<div className="flex items-center justify-between">
																<Button type="button" variant={'ghost'} onClick={() => setFeedbackState(!showFeedback)}>
																	Cancel
																</Button>

																<div className="flex items-center gap-2">
																	<Button disabled={isSubmiting.approve || isSubmiting.reject} onClick={() => submitFeedback(level, 'reject', index)} size={'sm'} variant={'outline'}>
																		{isSubmiting.reject && <LoadingSpinner />}
																		Reject
																	</Button>
																	<Button disabled={isSubmiting.approve || isSubmiting.reject} onClick={() => submitFeedback(level, 'approve', index)} size={'sm'}>
																		{isSubmiting.approve && <LoadingSpinner />}
																		Approve
																	</Button>
																</div>
															</div>
														</form>
													)}
												</div>
												{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
											</li>
										)}

										{level.action && (
											<li className="relative flex w-full gap-4">
												<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
												<div className="w-full space-y-2">
													<div className="flex items-center gap-2">
														<h3 className="text-sm capitalize">
															{level.first_name} {level.last_name}
														</h3>
														<Badge variant={'secondary-success'} className="px-2 py-px text-[10px]">
															{level.action}
														</Badge>
													</div>
													<p className="text-xs capitalize text-muted-foreground">{level.type}</p>
													<Card className="max-h-28 overflow-y-auto p-2 text-xs font-light leading-5 text-muted-foreground">{level.feedback}</Card>
												</div>
												{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
											</li>
										)}
									</React.Fragment>
								))}
							</ul>
						</TabsContent>

						<TabsContent value="details">
							<div className="grid w-full gap-16">
								<div>
									<h1 className="mb-4 text-base font-semibold">Applicant Details</h1>
									<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
										<li className="grid gap-3">
											<p className="text-sm font-medium">Full name</p>
											<p className="text-sm font-light">
												{applicantData?.first_name} {applicantData?.last_name}
											</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Email</p>
											<p className="text-sm font-light">{applicantData?.email}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Phone number</p>
											<p className="text-sm font-light capitalize">{applicantData?.phone_number}</p>
										</li>
									</ul>
								</div>

								<div>
									<h1 className="mb-4 text-base font-semibold">Location Details</h1>
									<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
										<li className="grid gap-3">
											<p className="text-sm font-medium">Country</p>
											<p className="text-sm font-light capitalize">{(applicantData?.country_location as any).name}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">State / City / Province</p>
											<p className="text-sm font-light">{applicantData?.state_location}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Work authorization</p>
											<p className="text-sm font-light">{(applicantData?.country_location as any).name}</p>
										</li>
										<li className="grid gap-3">
											<p className="text-sm font-medium">Requires sponsorship</p>
											<p className="text-sm font-light">{applicantData?.require_sponsorship ? 'Yes' : 'No'}</p>
										</li>
									</ul>
								</div>

								<div>
									<h1 className="mb-4 text-base font-semibold">Links</h1>
									<ul className="grid items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
										{(applicantData?.links as any[]).map(link => (
											<li key={link.name} className="grid gap-3">
												<p className="text-sm font-medium capitalize">{link.name}</p>
												<Link target="_blank" referrerPolicy="no-referrer" href={link.link} className="flex w-fit items-center gap-2 rounded-md bg-secondary p-1 text-sm font-light">
													{link.link} <ArrowUpRight size={14} className="rounded-sm bg-background" />
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
											<p className="text-sm font-light capitalize">{applicantData.race_ethnicity.replaceAll('-', ' ')}</p>
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

						{documents.length > 0 &&
							documents.map((document, index) => (
								<TabsContent key={index} value={document.name} className="w-[420px]">
									{document.format == 'pdf' && (
										<div className="group relative h-fit">
											<div ref={setContainerRef}>
												<Document options={options} loading={<Skeleton className="h-[554px] w-[448px]" />} className={'drop-shadow-2xl'} file={document.url} onLoadSuccess={onDocumentLoadSuccess}>
													<Page pageNumber={activePageNumber} loading={<Skeleton className="h-[554px] w-[448px]" />} width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth} />
												</Document>

												{numberOfPages > 1 && (
													<div className="pointer-events-none absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-4 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:opacity-100">
														<Button variant={'secondary'} disabled={activePageNumber <= 1} onClick={() => setActivePageNumber(activePageNumber - 1)} className="rounded-full">
															<ChevronLeft size={12} />
														</Button>
														<Button variant={'secondary'} disabled={activePageNumber >= numberOfPages} onClick={() => setActivePageNumber(activePageNumber + 1)} className="rounded-full">
															<ChevronRight size={12} />
														</Button>
													</div>
												)}

												<p className="mt-8 text-xs">
													Page {activePageNumber} of {numberOfPages}
												</p>
											</div>
										</div>
									)}

									{(document.format == 'png' || document.format == 'jpg' || document.format == 'jpeg') && document.url && (
										<div className="group relative h-fit">
											<Image src={document.url} alt={`applicant's ${document.name}`} width={350} height={500} className="object-contain" />
										</div>
									)}

									{document.format !== 'png' && document.format !== 'jpg' && document.format !== 'jpeg' && document.format !== 'pdf' && document.url && (
										<div className="flex w-full max-w-[350px] flex-col items-center justify-center gap-4 text-center text-xs">
											<p>Unable to open preview of this document format, sorry for the inconvinience, we&apos;re working on it.</p>
											<p>Please download document to preview</p>

											<div className="flex w-full items-center justify-center">
												<Link href={document.url} target="_blank" referrerPolicy="no-referrer" className={cn(buttonVariants(), 'flex gap-3')}>
													<CloudDownload size={14} /> Download Document
												</Link>
											</div>
										</div>
									)}

									{document.text && <div className="max-h-[500px] overflow-auto text-xs leading-7">{document.text}</div>}
								</TabsContent>
							))}
					</Tabs>

					{documents.length < 1 && <Skeleton className="mx-auto h-full max-h-[554px] w-full max-w-[350px]" />}
				</section>
			</SheetContent>
		</Sheet>
	);
};
