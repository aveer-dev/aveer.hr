import { Surface } from '../../Surface';
import { Toolbar } from '../../Toolbar';
import Tooltip from '../../Tooltip';
import { Pen, Trash2 } from 'lucide-react';

export type LinkPreviewPanelProps = {
	url: string;
	onEdit: () => void;
	onClear: () => void;
};

export const LinkPreviewPanel = ({ onClear, onEdit, url }: LinkPreviewPanelProps) => {
	return (
		<Surface className="flex items-center gap-2 p-2">
			<a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-sm underline">
				{url}
			</a>
			<Toolbar.Divider />
			<Tooltip title="Edit link">
				<Toolbar.Button onClick={onEdit}>
					<Pen />
				</Toolbar.Button>
			</Tooltip>
			<Tooltip title="Remove link">
				<Toolbar.Button onClick={onClear}>
					<Trash2 />
				</Toolbar.Button>
			</Tooltip>
		</Surface>
	);
};
