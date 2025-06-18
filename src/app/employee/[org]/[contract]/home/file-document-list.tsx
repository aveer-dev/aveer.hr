'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDocumentListProps {
	documentFiles: any[];
}

export default function FileDocumentList({ documentFiles }: FileDocumentListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [mask, setMask] = useState('linear-gradient(to left, transparent 0%, black 96px)');
	const [showLeft, setShowLeft] = useState(false);
	const [showRight, setShowRight] = useState(false);
	const scrollAmount = 160 + 32;

	// Update mask and button visibility on scroll
	const handleScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const { scrollLeft, scrollWidth, clientWidth } = el;
		if (scrollWidth <= clientWidth) {
			setMask('none');
			setShowLeft(false);
			setShowRight(false);
			return;
		}
		// At left
		if (scrollLeft <= 0) {
			setMask('linear-gradient(to left, transparent 0%, black 150px)');
			setShowLeft(false);
			setShowRight(true);
		} else if (scrollLeft + clientWidth >= scrollWidth - 1) {
			// At right end
			setMask('linear-gradient(to right, transparent 0%, black 96px)');
			setShowLeft(true);
			setShowRight(false);
		} else {
			setMask('linear-gradient(to right, transparent 0%, black 150px, black calc(100% - 150px), transparent 100%)');
			setShowLeft(true);
			setShowRight(true);
		}
	};

	useEffect(() => {
		handleScroll();
		const el = scrollRef.current;
		if (!el) return;
		el.addEventListener('scroll', handleScroll);
		return () => el.removeEventListener('scroll', handleScroll);
	}, [documentFiles.length]);

	// Scroll left/right by 80px
	const scrollBy = () => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	};

	if (!documentFiles.length) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
				<FileText size={32} className="mb-2" />
				<span>No documents shared with you yet</span>
			</div>
		);
	}

	return (
		<div className="relative space-y-4">
			<div className="flex items-center justify-between gap-2">
				<h2 className="mb-2 text-xs text-muted-foreground">Documents</h2>

				{/* <Link href={`./documents`} className={cn(buttonVariants({ variant: 'secondary', size: 'icon' }), 'h-8 w-8')}>
					<ArrowUpRight size={12} />
				</Link> */}
			</div>

			<div className="group relative">
				{showLeft && (
					<Button className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow group-focus-within:flex group-hover:flex" variant="secondary" size="icon" onClick={scrollBy} aria-label="Scroll left" type="button">
						<ChevronLeft size={16} />
					</Button>
				)}

				<div className="no-scrollbar overflow-x-auto" ref={scrollRef} style={{ maskImage: mask, WebkitMaskImage: mask }}>
					<ul className="flex w-max items-stretch gap-8 p-1">
						{documentFiles.map(file => (
							<li key={file.id} className="h-[146px] w-40">
								<Link
									href={`./documents/${(file.document as any)?.id}`}
									className="relative block h-full w-full space-y-4 rounded-2xl border bg-muted px-4 pb-4 pt-8 outline-none ring-offset-1 before:absolute before:left-0 before:right-0 before:top-0 before:h-12 before:rounded-t-2xl before:bg-primary/5 focus-visible:ring-1 focus-visible:ring-ring">
									<FileText size={24} className="text-muted-foreground" />
									<div className="line-clamp-2 text-base font-medium">{(file.document as any)?.name || file.name}</div>
								</Link>
							</li>
						))}
					</ul>
				</div>

				{showRight && (
					<Button className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow group-focus-within:flex group-hover:flex" variant="secondary" size="icon" onClick={scrollBy} aria-label="Scroll right" type="button">
						<ChevronRight size={16} />
					</Button>
				)}

				{!documentFiles.length && (
					<div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md bg-muted px-4 pb-4 pt-8 text-sm text-muted-foreground">
						<span>No documents shared with you yet</span>
					</div>
				)}
			</div>
		</div>
	);
}
