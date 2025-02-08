import Link from 'next/link';
import { NewDocumentButton } from './new-document-button';
import { format } from 'date-fns';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { BookDashed } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export const DocumentsList = ({ documents, createDocument }: { documents: Tables<'documents'>[]; createDocument: () => Promise<PostgrestSingleResponse<Tables<'documents'>>> }) => {
	return (
		<AnimatedGroup
			className="grid grid-cols-1 gap-x-12 gap-y-8 @sm:grid-cols-1 @sm:gap-y-12 @md:grid-cols-3 @md:gap-y-16 @[49rem]:grid-cols-5"
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
			}}>
			<NewDocumentButton createDocument={createDocument} />

			{documents.map(doc => (
				<Link
					key={doc.id + 'document'}
					href={`./documents/${doc.id}`}
					className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-secondary bg-accent/50 text-left text-sm font-light drop-shadow-sm transition-all duration-500 hover:scale-105 hover:drop-shadow">
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
				</Link>
			))}
		</AnimatedGroup>
	);
};
