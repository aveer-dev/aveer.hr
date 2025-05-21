'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FileWithAccess } from '@/dal/interfaces/file-management.types';
import { getFileDownloadUrl, getFileUrl } from './file.actions';
import { PageLoader } from '@/components/ui/page-loader';
import { LoadingSpinner } from '@/components/ui/loader';
import Image from 'next/image';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { toast } from 'sonner';
import { useResizeObserver } from '@wojtekmaj/react-hooks';

// Set workerSrc for pdfjs
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = new URL('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs', import.meta.url).toString();

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/'
};

const resizeObserverOptions = {};

const maxWidth = 800;

interface StorageFilePreviewDialogProps {
	file: FileWithAccess | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function StorageFilePreviewDialog({ file, open, onOpenChange }: StorageFilePreviewDialogProps) {
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState<string | null>(null);
	const [iframeLoaded, setIframeLoaded] = useState(false);
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState<string | null>(null);
	const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
	const [containerWidth, setContainerWidth] = useState<number>();

	const onResize = useCallback<ResizeObserverCallback>(entries => {
		const [entry] = entries;

		if (entry) {
			setContainerWidth(entry.contentRect.width);
		}
	}, []);

	useResizeObserver(containerRef, resizeObserverOptions, onResize);

	useEffect(() => {
		setUrl(null);

		if (open && file && file.storage_url) {
			setLoading(true);
			setIframeLoaded(false);
			getFileUrl(file).then(({ data, error }) => {
				if (error) toast.error('Failed to get file URL', { description: error.message });
				if (data) setUrl(data.signedUrl);
				console.log(data);
				setLoading(false);
			});
		} else {
			setLoading(false);
			setIframeLoaded(false);
		}
	}, [open, file]);

	// Helper to get file extension
	function getFileExtension(filename?: string | null): string | null {
		if (!filename) return null;
		const parts = filename.split('.');
		if (parts.length < 2) return null;
		return parts.pop()?.toLowerCase() || null;
	}

	// Helper to detect file type
	function getFileType(extension: string | null): 'image' | 'pdf' | 'doc' | 'other' {
		if (!extension) return 'other';
		if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) return 'image';
		if (extension === 'pdf') return 'pdf';
		if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'].includes(extension)) return 'doc';
		return 'other';
	}

	const extension = getFileExtension(file?.name);
	const fileType = getFileType(extension);

	// Memoize the options object for react-pdf Document
	const pdfOptions = useMemo(() => ({ cMapUrl: 'cmaps/', cMapPacked: true }), []);

	// Memoize the file prop for react-pdf Document
	const pdfFile = useMemo(() => url, [url]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-w-6xl">
				<DialogTitle>{file?.name}</DialogTitle>
				<DialogDescription>File preview</DialogDescription>

				<div className="flex min-h-[400px] max-w-2xl items-center justify-center">
					{loading || !url ? (
						<div className="flex h-[70vh] w-full flex-col items-center justify-center">
							<LoadingSpinner />
							<span className="text-sm text-muted-foreground">Loading file preview...</span>
						</div>
					) : null}

					{/* Custom preview logic */}
					{url && fileType === 'image' && (
						<div className="flex h-[70vh] w-full items-center justify-center">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={url} alt={file?.name || 'Image preview'} className="max-h-[70vh] max-w-full rounded border object-contain" />
						</div>
					)}
					{url && fileType === 'pdf' && (
						<div className="flex h-[70vh] w-full flex-col items-center overflow-auto" ref={setContainerRef}>
							<Document
								file={pdfFile}
								onLoadSuccess={({ numPages }) => {
									setNumPages(numPages);
									setPdfLoading(false);
									setPdfError(null);
								}}
								onLoadError={error => {
									setPdfError(error.message || 'Failed to load PDF');
									setPdfLoading(false);
								}}
								loading={
									<PageLoader className="flex h-[70vh] w-full flex-col items-center justify-center">
										<LoadingSpinner />
										<span className="text-sm text-muted-foreground">Loading PDF...</span>
									</PageLoader>
								}
								options={options}>
								{Array.from(new Array(numPages || 0), (el, index) => (
									<Page key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth} />
								))}
							</Document>
							{pdfError && <div className="mt-2 text-xs text-red-500">{pdfError}</div>}
						</div>
					)}
					{url && fileType === 'doc' && (
						<div className="mx-auto mt-16 flex w-full flex-col items-center justify-center gap-4 rounded-md border bg-muted/70 px-16 py-12 text-center text-xs">
							<p>Preview for this document type is not supported yet.</p>
							<p>Please download the file to view it.</p>
							<div className="flex w-full items-center justify-center">
								<a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
									Download Document
								</a>
							</div>
						</div>
					)}
					{url && fileType === 'other' && (
						<div className="mx-auto mt-16 flex w-full flex-col items-center justify-center gap-4 rounded-md border bg-muted/70 px-16 py-12 text-center text-xs">
							<p>Unable to preview this file type.</p>
							<p>Please download the file to view it.</p>
							<div className="flex w-full items-center justify-center">
								<a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
									Download File
								</a>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
