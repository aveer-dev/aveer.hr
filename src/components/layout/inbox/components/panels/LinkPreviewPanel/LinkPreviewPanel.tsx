import { Icon } from '../../Icon';
import { Surface } from '../../Surface';
import { Toolbar } from '../../Toolbar';

export type LinkPreviewPanelProps = {
	url: string;
	onEdit: () => void;
	onClear: () => void;
};

export const LinkPreviewPanel = ({ onClear, onEdit, url }: LinkPreviewPanelProps) => {
	return (
		<Surface className="flex items-center gap-1 px-2 py-1">
			<a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-xs underline">
				{url}
			</a>

			<Toolbar.Divider />

			<div className="flex">
				<Toolbar.Button tooltip="Edit link" onClick={onEdit}>
					<Icon name="Pen" />
				</Toolbar.Button>

				<Toolbar.Button tooltip="Remove link" onClick={onClear}>
					<Icon name="Trash2" />
				</Toolbar.Button>
			</div>
		</Surface>
	);
};
