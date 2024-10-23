import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APPLICANT, DOCUMENT } from '@/type/roles.types';
import { createClient } from '@/utils/supabase/client';
import { TabsContent } from '@radix-ui/react-tabs';
import { CloudDownload } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import Image from 'next/image';
import { DocumentViewer } from 'react-documents';
import { LoadingSpinner } from '@/components/ui/loader';

interface props {
	applicantData: APPLICANT;
	documents: DOCUMENT[];
	setDocuments: (doc: DOCUMENT[]) => void;
}

const supabase = createClient();
const resizeObserverOptions = {};
const maxWidth = 420;

export const ApplicantDocuments = ({ applicantData, documents, setDocuments }: props) => {
	const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>();

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
					<div className="relative h-[60vh]">
						<div className="relative z-10 h-full">
							<DocumentViewer queryParams="hl=Nl" url={'https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/job-applications/applications/best-orgs/37/AcctNotice_2022-10-13.pdf'}></DocumentViewer>
						</div>

						<div className="absolute left-0 top-0 z-0 flex h-full w-full items-center justify-center">
							<LoadingSpinner />
						</div>
					</div>
				)}

				{(document.format == 'png' || document.format == 'jpg' || document.format == 'jpeg') && document.url && (
					<div className="group relative h-fit">
						<Image src={document.url} alt={`applicant's ${document}`} width={350} height={500} className="object-contain" />
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
