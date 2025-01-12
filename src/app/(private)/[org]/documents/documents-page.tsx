import Link from 'next/link';
import { NewDocumentButton } from './new-document-button';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { BookDashed } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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
			className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-1 sm:gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-5"
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
						{doc.template && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant={'ghost'} className="absolute right-0 top-0 text-yellow-600">
											<BookDashed size={14} />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-40 font-extralight">Template document</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}

						<div className="space-y-2 p-2 text-center">
							<div>{doc.name}</div>
							<div className="text-xs text-muted-foreground">Updated: {format(doc.updated_at, 'PPP')}</div>
						</div>
					</li>
				</Link>
			))}
		</AnimatedGroup>
	);
};
