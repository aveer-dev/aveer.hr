import { Link } from 'lucide-react';
import { LinkEditorPanel } from '../../../panels';
import { Toolbar } from '../../../Toolbar';
import * as Popover from '@radix-ui/react-popover';

export type EditLinkPopoverProps = {
	onSetLink: (link: string, openInNewTab?: boolean) => void;
};

export const EditLinkPopover = ({ onSetLink }: EditLinkPopoverProps) => {
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<Toolbar.Button tooltip="Set Link">
					<Link />
				</Toolbar.Button>
			</Popover.Trigger>
			<Popover.Content>
				<LinkEditorPanel onSetLink={onSetLink} />
			</Popover.Content>
		</Popover.Root>
	);
};
