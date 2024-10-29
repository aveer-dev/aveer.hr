import { Link } from 'lucide-react';
import { LinkEditorPanel } from '../../../panels';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type EditLinkPopoverProps = {
	onSetLink: (link: string, openInNewTab?: boolean) => void;
};

export const EditLinkPopover = ({ onSetLink }: EditLinkPopoverProps) => {
	const [isOpen, toggleOpenState] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={toggleOpenState}>
			<PopoverTrigger asChild>
				<Button variant={isOpen ? 'secondary' : 'ghost'} className="h-8 min-w-[2rem] p-1" tooltip="Set link">
					<Link size={12} />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-fit p-2 shadow-sm" side="top" sideOffset={10}>
				<LinkEditorPanel onSetLink={onSetLink} />
			</PopoverContent>
		</Popover>
	);
};
