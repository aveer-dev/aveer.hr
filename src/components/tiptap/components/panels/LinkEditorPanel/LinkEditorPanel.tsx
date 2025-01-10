import { useState, useCallback, useMemo } from 'react';
import { Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '../../Icon';

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
			<form
				onSubmit={event => {
					state.setOpenInNewTab(true);
					state.handleSubmit(event);
				}}>
				<label className="flex w-[280px] cursor-text items-center gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900">
					<Link size={12} />
					<input type="url" className="w-full min-w-[12rem] flex-1 bg-transparent text-xs font-light text-black outline-none dark:text-white" placeholder="Enter URL" value={state.url} onChange={state.onChange} />
				</label>

				<button disabled={!state.isValidUrl} className={cn('flex h-0 w-full gap-2 overflow-hidden rounded-md bg-muted px-2 py-1 text-left text-xs transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-25', !!state.url && 'mt-3 h-11')}>
					<Icon name="Globe" className="mt-1" />

					<div className="space-y-1">
						<div className="max-w-[250px] truncate font-normal">{state.url}</div>
						<div className="font-light text-muted-foreground">Link to webpage</div>
					</div>
				</button>
			</form>
		</>
	);
};
