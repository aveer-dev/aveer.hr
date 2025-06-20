import path from 'path';
import fs from 'fs/promises';
import { compileMDX, CompileMDXResult } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UPDATE } from '@/type/updates';
import { Update } from '../update';
import { ChevronLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CONTENTS_DIR = path.join(process.cwd(), 'src/updates-content/employee');
const CONTENTS_DIR_ADMIN = path.join(process.cwd(), 'src/updates-content/admin');

async function getPostBySlug(slug: string): Promise<CompileMDXResult<UPDATE> | null> {
	const files = await fs.readdir(CONTENTS_DIR);
	const filesAdmin = await fs.readdir(CONTENTS_DIR_ADMIN);
	const file = [...files, ...filesAdmin].find(f => f.endsWith('.mdx') && f.includes(slug));
	if (!file) return null;
	const filePath = path.join(CONTENTS_DIR, file);
	const source = await fs.readFile(filePath, 'utf8');
	const data = await compileMDX<UPDATE>({ source, options: { parseFrontmatter: true } });
	return data;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
	const post = await getPostBySlug((await params).slug);
	if (!post) return notFound();

	return (
		<div className="mx-auto mb-36 flex max-w-7xl px-5">
			{/* Sidebar */}
			<aside className="sticky top-16 hidden h-screen w-64 space-y-5 px-6 pt-44 sm:block">
				<Link href="/updates" className={cn(buttonVariants({ variant: 'link' }), 'justify-start gap-2 px-0 hover:no-underline')}>
					<ChevronLeft size={16} />
					View all posts
				</Link>

				<div className="mb-2 text-sm font-medium">{new Date(post.frontmatter.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
			</aside>
			{/* Main content */}
			<main className="space-y-16 p-6 pt-24 sm:pt-44">
				<Update update={post} />
			</main>
		</div>
	);
}
