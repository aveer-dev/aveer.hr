'use client';

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { createClient } from '@/utils/supabase/client';
import { ArrowUpRight, ChevronLeft, ChevronRight, CloudDownload, Maximize2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface props {
	data: Tables<'job_applications'>;
}

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/'
};

const supabase = createClient();
const resizeObserverOptions = {};
const maxWidth = 420;

export const ApplicantDetails = ({ data }: props) => {
	const [numberOfPages, setNumberOfPages] = useState<number>(0);
	const [activePageNumber, setActivePageNumber] = useState<number>(1);
	interface DOCUMENT {
		name: string;
		url?: string;
		text?: string;
		format?: string;
	}

	const [documents, setDocuments] = useState<DOCUMENT[]>([]);
	const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>();

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
		setNumberOfPages(numPages);
	};

	const onResize = useCallback<ResizeObserverCallback>(entries => {
		const [entry] = entries;

		if (entry) {
			setContainerWidth(entry.contentRect.width);
		}
	}, []);

	const gatherDocuments = () => {
		const allDocuments: DOCUMENT[] = [...documents];

		const resumeWithURL = data.documents.find((doc: any) => doc.name == 'resume');
		if (!resumeWithURL && data.resume) allDocuments.push({ name: 'resume', text: data.resume });

		const textCoverLetter = data.documents.find((doc: any) => doc.name == 'cover letter');
		if (!textCoverLetter && data.cover_letter) allDocuments.push({ name: 'cover letter', text: data.cover_letter });

		const getDocumentLink = (url: string) => {
			const { data } = supabase.storage.from('job-applications').getPublicUrl(url);
			const breakDownString = data.publicUrl.split('.');
			return { url: data.publicUrl, format: breakDownString[breakDownString.length - 1] };
		};

		if (data.documents.length) {
			data.documents.forEach((doc: any) => {
				const docData = getDocumentLink(doc.path);
				allDocuments.push({ ...docData, name: doc.name });
				setDocuments(allDocuments);
			});
		} else {
			setDocuments(allDocuments);
		}
	};

	useEffect(() => {
		gatherDocuments();
	}, []);

	useResizeObserver(containerRef, resizeObserverOptions, onResize);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={'ghost'} size={'icon'}>
					<Maximize2 size={14} className="text-muted-foreground" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="block h-screen max-w-5xl pt-16">
				<AlertDialogHeader className="relative">
					<AlertDialogCancel className="absolute -left-16 top-1/2 -translate-y-1/2 rounded-full">
						<ChevronLeft size={12} />
					</AlertDialogCancel>

					<AlertDialogTitle className="text-xl">
						<span className="font-normal text-muted-foreground">Role:</span> {(data.role as any).job_title}
					</AlertDialogTitle>
					<div className="flex gap-2">
						<AlertDialogDescription>Stage: </AlertDialogDescription>
						<Badge className="font-light" variant={'secondary'}>
							{data.stage}
						</Badge>
					</div>
				</AlertDialogHeader>

				<section className="flex justify-between pt-10">
					<div className="grid h-[70vh] w-full gap-16 overflow-auto border-r pr-8">
						<div>
							<h1 className="mb-4 text-base font-semibold">Applicant Details</h1>
							<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
								<li className="grid gap-3">
									<p className="text-sm font-medium">Full name</p>
									<p className="text-sm font-light">
										{data?.first_name} {data?.last_name}
									</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Email</p>
									<p className="text-sm font-light">{data?.email}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Phone number</p>
									<p className="text-sm font-light capitalize">{data?.phone_number}</p>
								</li>
							</ul>
						</div>

						<div>
							<h1 className="mb-4 text-base font-semibold">Location Details</h1>
							<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
								<li className="grid gap-3">
									<p className="text-sm font-medium">Country</p>
									<p className="text-sm font-light capitalize">{(data?.country_location as any).name}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">State / City / Province</p>
									<p className="text-sm font-light">{data?.state_location}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Work authorization</p>
									<p className="text-sm font-light">{(data?.country_location as any).name}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Requires sponsorship</p>
									<p className="text-sm font-light">{data?.require_sponsorship ? 'Yes' : 'No'}</p>
								</li>
							</ul>
						</div>

						<div>
							<h1 className="mb-4 text-base font-semibold">Links</h1>
							<ul className="grid items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
								{(data?.links as any[]).map(link => (
									<li key={link.name} className="grid gap-3">
										<p className="text-sm font-medium capitalize">{link.name}</p>
										<Link target="_blank" referrerPolicy="no-referrer" href={link.link} className="flex w-fit items-center gap-2 rounded-md bg-secondary p-1 text-sm font-light">
											{link.link} <ArrowUpRight size={14} className="rounded-sm bg-background" />
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h1 className="mb-4 text-base font-semibold">Voluntary Self-Identification</h1>
							<ul className="grid grid-cols-2 items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
								<li className="grid gap-3">
									<p className="text-sm font-medium">Gender</p>
									<p className="text-sm font-light capitalize">{data.gender}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Race / Ethnicity</p>
									<p className="text-sm font-light capitalize">{data.race_ethnicity.replaceAll('-', ' ')}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Veterian Status</p>
									<p className="text-sm font-light capitalize">{data.veterian_status}</p>
								</li>
								<li className="grid gap-3">
									<p className="text-sm font-medium">Disability status</p>
									<p className="text-sm font-light capitalize">{data.disability}</p>
								</li>
							</ul>
						</div>
					</div>

					{documents.length > 0 && (
						<Tabs defaultValue={documents[0].name} className="w-[420px] pl-8">
							<TabsList className="mb-6 grid w-fit grid-cols-2">
								{documents.map((document, index) => (
									<TabsTrigger key={index} className="capitalize" value={document.name}>
										{document.name}
									</TabsTrigger>
								))}
							</TabsList>

							{documents.map((document, index) => (
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
					)}

					{documents.length < 1 && <Skeleton className="mx-auto h-full max-h-[554px] w-full max-w-[350px]" />}
				</section>

				{/* <AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter> */}
			</AlertDialogContent>
		</AlertDialog>
	);
};