'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CompileMDXResult } from 'next-mdx-remote/rsc';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Update } from './update';
import { UPDATE } from '@/type/updates';

interface UpdatesListProps {
	updates: CompileMDXResult<UPDATE>[];
	page: number;
	totalPages: number;
}

export default function UpdatesList({ updates, page, totalPages }: UpdatesListProps) {
	const [activeSlug, setActiveSlug] = useState<string>('');
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		// Create a single observer for all articles
		observerRef.current = new IntersectionObserver(
			entries => {
				// Find the entry with the highest intersection ratio
				const visibleEntry = entries.reduce((prev, current) => {
					return (prev?.intersectionRatio ?? 0) > (current?.intersectionRatio ?? 0) ? prev : current;
				});

				if (visibleEntry?.isIntersecting && visibleEntry.target instanceof HTMLElement) {
					setActiveSlug(visibleEntry.target.id);
				}
			},
			{
				root: null,
				threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better accuracy
				rootMargin: '-45% 0px -45% 0px' // Observe middle 10% of viewport
			}
		);

		// Observe all articles
		updates.forEach(update => {
			const element = document.getElementById(update.frontmatter.slug);
			if (element && observerRef.current) {
				observerRef.current.observe(element);
			}
		});

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [updates]);

	const getItemTranslateY = (index: number) => {
		const activeIndex = updates.findIndex(update => update.frontmatter.slug === activeSlug);
		if (activeIndex === -1) return 0;

		// Apply a small offset to items based on their position relative to active item
		return index < activeIndex ? -21 : index > activeIndex ? 21 : 0;
	};

	const getListTranslateY = () => {
		const activeIndex = updates.findIndex(update => update.frontmatter.slug === activeSlug);
		if (activeIndex === -1) return 0;

		// Calculate position to center active item in the visible area of mask
		// The mask is positioned at about 260px from top (based on mask-image gradient)
		const itemHeight = 24; // Approximate height of each item including margin
		const visibleCenter = 0; // Center of the visible area in the mask
		const targetPosition = visibleCenter - itemHeight * activeIndex;

		return targetPosition;
	};

	const scrollToUpdate = (slug: string) => {
		const element = document.getElementById(slug);
		if (!element) return;

		const windowHeight = window.innerHeight;
		const targetPosition = element.getBoundingClientRect().top + window.scrollY - windowHeight * 0.25;

		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});
	};

	return (
		<div className="mx-auto mb-36 flex max-w-7xl px-5">
			{/* Sidebar */}
			<aside className="sticky top-16 hidden h-screen w-64 px-6 pt-44 [mask-image:linear-gradient(transparent_10%,_rgb(0_0_0)_200px,_transparent_60%)] sm:block">
				<ul className="w-full space-y-2 transition-transform duration-500 ease-in-out" style={{ transform: `translateY(${getListTranslateY()}px)` }}>
					{updates.map((update, index) => (
						<li key={update.frontmatter.slug} className="w-full text-left transition-transform duration-300 ease-in-out" style={{ transform: `translateY(${getItemTranslateY(index)}px)` }}>
							<button onClick={() => scrollToUpdate(update.frontmatter.slug)} className={`w-full text-left text-sm ${activeSlug === update.frontmatter.slug ? 'text-primary' : 'text-muted-foreground'} hover:text-primary/90`}>
								{new Date(update.frontmatter.date).toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</button>
						</li>
					))}
				</ul>
			</aside>

			{/* Main content */}
			<main className="space-y-16 p-6 pt-24 sm:pt-44">
				{updates.map(update => (
					<Update key={update.frontmatter.slug} update={update} />
				))}

				{/* Pagination */}
				<div className="mt-12 flex items-center justify-center gap-4">
					<span className="text-xs text-muted-foreground">
						Page {page} of {totalPages}
					</span>

					<Link href={`/updates?page=${page - 1}`} className={cn(buttonVariants({ variant: 'secondary' }), `ml-auto text-sm ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`)} aria-disabled={page <= 1}>
						Previous
					</Link>

					<Link href={`/updates?page=${page + 1}`} className={cn(buttonVariants({ variant: 'secondary' }), `text-sm ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`)} aria-disabled={page >= totalPages}>
						Next
					</Link>
				</div>
			</main>
		</div>
	);
}
