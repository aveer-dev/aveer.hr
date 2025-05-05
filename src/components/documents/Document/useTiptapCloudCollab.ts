import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { TiptapCollabProvider } from '@hocuspocus/provider';

function getRandomColor() {
	// Generate a random pastel color
	const hue = Math.floor(Math.random() * 360);
	return `hsl(${hue}, 70%, 80%)`;
}

function getAvatarFromName(name: string) {
	if (!name) return '';
	const parts = name.trim().split(' ');
	if (parts.length === 1) return parts[0][0].toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function useTiptapCloudCollab({ docId, appId, token, onSynced, name }: { docId: string; appId: string; token?: string; onSynced?: () => void; name: string }) {
	const ydoc = useRef(new Y.Doc());
	const provider = useRef<TiptapCollabProvider | null>(null);
	const color = useRef(getRandomColor());

	useEffect(() => {
		// Generate a new color on every docId change (i.e., document update)
		color.current = getRandomColor();
		provider.current = new TiptapCollabProvider({
			name: docId,
			appId,
			token,
			document: ydoc.current,
			onSynced
		});
		// Set awareness state for the current user
		if (name && provider.current && provider.current.awareness) {
			provider.current.awareness.setLocalStateField('user', {
				name,
				color: color.current,
				avatar: getAvatarFromName(name)
			});
		}
		const cleanupProvider = provider.current;
		const cleanupYdoc = ydoc.current;
		return () => {
			cleanupProvider?.destroy();
			cleanupYdoc?.destroy();
		};
	}, [docId, appId, token, onSynced, name]);

	return {
		ydoc: ydoc.current,
		provider: provider.current,
		awareness: provider.current?.awareness,
		color: color.current
	};
}
