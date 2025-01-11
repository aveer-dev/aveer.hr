import Link from 'next/link';
import { NewDocumentButton } from './new-document-button';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { AnimatedGroup } from '@/components/ui/animated-group';

export const DocumentsPage = async ({ org }: { org: string }) => {
	const supabase = await createClient();

	const { data, error } = await supabase.from('documents').select('*').match({ org }).order('updated_at', { ascending: false });
	if (error) return <div className="flex min-h-48 items-center justify-center rounded-md bg-accent italic">{error.message}</div>;

	const createDocument = async () => {
		'use server';

		const supabase = await createClient();
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return redirect('/login');

		const res = await supabase
			.from('documents')
			.insert({ org, editors: [user.id], name: `New Document - ${format(new Date(), 'PPP')}` })
			.select()
			.single();
		return res;
	};

	return (
		<AnimatedGroup
			className="grid grid-cols-4 gap-x-20 gap-y-16"
			variants={{
				container: {
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							staggerChildren: 0.05
						}
					}
				},
				item: {
					hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
					visible: {
						opacity: 1,
						y: 0,
						filter: 'blur(0px)',
						transition: {
							duration: 1.2,
							type: 'spring',
							bounce: 0.3
						}
					}
				}
			}}
			asChild={'ul'}>
			<NewDocumentButton createDocument={createDocument} />

			{data.map(doc => (
				<Link key={doc.id + 'document'} href={`./documents/${doc.id}`} passHref legacyBehavior>
					<li className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-secondary bg-accent/50 text-left text-sm font-light drop-shadow-sm transition-all duration-500 hover:scale-105 hover:drop-shadow">
						<div className="space-y-2 p-2">
							<div>{doc.name}</div>
							<div className="text-xs text-muted-foreground">Last updated at: {format(doc.updated_at, 'PPP')}</div>
						</div>
					</li>
				</Link>
			))}
		</AnimatedGroup>
	);
};
