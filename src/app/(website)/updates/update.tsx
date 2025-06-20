'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UPDATE } from '@/type/updates';
import { CompileMDXResult } from 'next-mdx-remote/rsc';
import { Copy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

export const Update = ({ update }: { update: CompileMDXResult<UPDATE> }) => {
	const copyLinkToUpdate = (slug: string) => {
		navigator.clipboard.writeText(window.location.href + `/updates/${slug}`);
		toast.success('Link copied to clipboard');
	};

	return (
		<article key={update.frontmatter.slug} id={update.frontmatter.slug} className="mx-auto w-full max-w-2xl [&_img]:rounded-md">
			<div className="mb-4 flex items-center gap-2">
				{update.frontmatter.tag &&
					update.frontmatter.tag.map(tag => (
						<Badge key={tag} className="flex items-center gap-2 rounded-sm px-3 py-1.5" variant={'outline'}>
							<Sparkles size={12} />
							{tag}
						</Badge>
					))}
			</div>

			<h1 className="text-xl font-bold">
				<Link className="no-underline" href={`/updates/${update.frontmatter.slug}`}>
					{update.frontmatter.title}
				</Link>
			</h1>

			<div className="prose prose-slate prose-sm prose-img:rounded-md prose-img:border prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-600 prose-a:text-gray-600 mb-4 max-w-none">{update.content}</div>

			<div className="mt-12 flex items-center justify-between gap-2">
				<a href={update.frontmatter.author.link} className="text-sm">
					{update.frontmatter.author.name}
					{update.frontmatter.author.title && <span className="pl-2 text-muted-foreground"> {update.frontmatter.author.title}</span>}
				</a>

				{/* Copy link to update */}
				<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLinkToUpdate(update.frontmatter.slug)}>
					<Copy size={12} />
				</Button>
			</div>

			<Separator className="mt-8" />
		</article>
	);
};
