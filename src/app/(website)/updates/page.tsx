import path from 'path';
import fs from 'fs/promises';
import { compileMDX, CompileMDXResult } from 'next-mdx-remote/rsc';
import UpdatesList from './updates-list';
import { UPDATE } from '@/type/updates';

const POSTS_PER_PAGE = 10;
const CONTENTS_DIR = path.join(process.cwd(), 'src/updates-content/employee');
// const CONTENTS_DIR_ADMIN = path.join(process.cwd(), 'src/updates-content/admin');

async function getUpdates(): Promise<CompileMDXResult<UPDATE>[]> {
	const files = await fs.readdir(CONTENTS_DIR);
	// const filesAdmin = await fs.readdir(CONTENTS_DIR_ADMIN);
	const posts = await Promise.all(
		files
			.filter(file => file.endsWith('.mdx'))
			.map(async file => {
				const filePath = path.join(CONTENTS_DIR, file);
				const source = await fs.readFile(filePath, 'utf8');
				const data = await compileMDX<UPDATE>({ source, options: { parseFrontmatter: true } });
				return data;
			})
	);
	return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

function getPageParam(searchParams: { [key: string]: string | string[] | undefined }) {
	const pageParam = searchParams?.page;
	if (!pageParam) return 1;
	if (Array.isArray(pageParam)) return parseInt(pageParam[0] || '1', 10);
	return parseInt(pageParam, 10) || 1;
}

export default async function UpdatesPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] }> }) {
	const updates = await getUpdates();
	const page = getPageParam((await searchParams) || {});
	const totalPages = Math.ceil(updates.length / POSTS_PER_PAGE);
	const paginatedUpdates = updates.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

	return <UpdatesList updates={paginatedUpdates} page={page} totalPages={totalPages} />;
}
