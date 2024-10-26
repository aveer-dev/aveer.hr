import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'lucide-react';
import { Label } from '@/components/ui/label';

export type LinkEditorPanelProps = {
	initialUrl?: string;
	initialOpenInNewTab?: boolean;
	onSetLink: (url: string, openInNewTab?: boolean) => void;
};

export const useLinkEditorState = ({ initialUrl, initialOpenInNewTab, onSetLink }: LinkEditorPanelProps) => {
	const [url, setUrl] = useState(initialUrl || '');
	const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab || false);

	const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(event.target.value);
	}, []);

	const isValidUrl = useMemo(() => /^(\S+):(\/\/)?\S+$/.test(url), [url]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (isValidUrl) {
				onSetLink(url, openInNewTab);
			}
		},
		[url, isValidUrl, openInNewTab, onSetLink]
	);

	return {
		url,
		setUrl,
		openInNewTab,
		setOpenInNewTab,
		onChange,
		handleSubmit,
		isValidUrl
	};
};

export const LinkEditorPanel = ({ onSetLink, initialOpenInNewTab, initialUrl }: LinkEditorPanelProps) => {
	const state = useLinkEditorState({ onSetLink, initialOpenInNewTab, initialUrl });

	return (
		<>
			<form onSubmit={state.handleSubmit} className="flex items-center gap-2">
				<label className="flex cursor-text items-center gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900">
					<Link size={12} />
					<input type="url" className="min-w-[12rem] flex-1 bg-transparent text-sm text-black outline-none dark:text-white" placeholder="Enter URL" value={state.url} onChange={state.onChange} />
				</label>
				<Button type="submit" disabled={!state.isValidUrl}>
					Set Link
				</Button>
			</form>
			<div className="mt-3">
				<Label className="flex items-center justify-between">
					Open in new tab
					<Switch className="scale-75" checked={state.openInNewTab} onCheckedChange={state.setOpenInNewTab} />
				</Label>
			</div>
		</>
	);
};
