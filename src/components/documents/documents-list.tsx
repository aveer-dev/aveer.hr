import { NewDocumentButton } from './new-document-button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { Tables } from '@/type/database.types';
import { DocumentItem } from './document-item';
interface DocumentsListProps {
	documents: Tables<'documents'>[];
	currentUserId: string;
	org: string;
}

export const DocumentsList = ({ documents, currentUserId, org }: DocumentsListProps) => {
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
			<NewDocumentButton org={org} />

			{documents.map(doc => (
				<DocumentItem key={doc.id + 'document'} document={doc} currentUserId={currentUserId} />
			))}
		</AnimatedGroup>
	);
};
