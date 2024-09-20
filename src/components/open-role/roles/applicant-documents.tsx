import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { APPLICANT, DOCUMENT } from '@/type/roles.types';
import { createClient } from '@/utils/supabase/client';
import { TabsContent } from '@radix-ui/react-tabs';
import { ChevronLeft, ChevronRight, CloudDownload } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Page, Document } from 'react-pdf';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import Image from 'next/image';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface props {
	applicantData: APPLICANT;
	documents: DOCUMENT[];
	setDocuments: (doc: DOCUMENT[]) => void;
}

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/'
};

const supabase = createClient();
const resizeObserverOptions = {};
const maxWidth = 420;

export const ApplicantDocuments = ({ applicantData, documents, setDocuments }: props) => {
	const [numberOfPages, setNumberOfPages] = useState<number>(0);
	const [activePageNumber, setActivePageNumber] = useState<number>(1);

	const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>();

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
		setNumberOfPages(numPages);
	};

	const gatherDocuments = useCallback(() => {
		const allDocuments: DOCUMENT[] = [];

		const resumeWithURL = applicantData.documents?.find((doc: any) => doc.name == 'resume');
		if (!resumeWithURL && applicantData.resume) allDocuments.push({ name: 'resume', text: applicantData.resume });

		const textCoverLetter = applicantData.documents?.find((doc: any) => doc.name == 'cover letter');
		if (!textCoverLetter && applicantData.cover_letter) allDocuments.push({ name: 'cover letter', text: applicantData.cover_letter });

		const getDocumentLink = (url: string) => {
			const { data } = supabase.storage.from('job-applications').getPublicUrl(url);
			const breakDownString = data.publicUrl.split('.');
			return { url: data.publicUrl, format: breakDownString[breakDownString.length - 1] };
		};

		if (applicantData.documents?.length) {
			applicantData.documents?.forEach((doc: any) => {
				const docData = getDocumentLink(doc.path);
				allDocuments.push({ ...docData, name: doc.name });
				setDocuments(allDocuments);
			});
		} else {
			setDocuments(allDocuments);
		}
	}, [applicantData, setDocuments]);

	const onResize = useCallback<ResizeObserverCallback>(entries => {
		const [entry] = entries;

		if (entry) {
			setContainerWidth(entry.contentRect.width);
		}
	}, []);

	useResizeObserver(containerRef, resizeObserverOptions, onResize);

	useEffect(() => {
		gatherDocuments();
	}, [gatherDocuments]);

	return (
		documents.length > 0 &&
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
		))
	);
};

// {documents.length < 1 && <Skeleton className="mx-auto h-full max-h-[554px] w-full max-w-[350px]" />}
