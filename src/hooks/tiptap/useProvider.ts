import { useEffect, useState, useRef } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';

type AwarenessUser = {
	id: string;
	name: string;
	color: string;
};

type UseHocuspocusProviderOptions = {
	url: string;
	documentId: string;
	token?: string;
	document: Y.Doc;
	user: AwarenessUser;
};

export function useHocuspocusProvider({ url, documentId, token, document, user }: UseHocuspocusProviderOptions) {
	const [awarenessStates, setAwarenessStates] = useState<AwarenessUser[]>([]);
	const [status, setStatus] = useState<string>('disconnected');
	const providerRef = useRef<HocuspocusProvider | null>(null);

	useEffect(() => {
		const provider = new HocuspocusProvider({
			url,
			name: documentId,
			token,
			document
		});

		providerRef.current = provider;

		provider.on('status', (event: any) => {
			setStatus(event.status);
			console.log('HocuspocusProvider status:', event.status);
		});

		if (provider.awareness) {
			provider.awareness.setLocalStateField('user', user);
		}

		const onAwarenessChange = () => {
			if (!providerRef.current || !providerRef.current.awareness) return;
			const states = Array.from(providerRef.current.awareness.getStates().values())
				.map((state: any) => state.user)
				.filter(Boolean);
			setAwarenessStates(states);
		};

		if (provider.awareness) {
			provider.awareness.on('change', onAwarenessChange);
			onAwarenessChange();
		}

		return () => {
			if (provider.awareness) {
				provider.awareness.off('change', onAwarenessChange);
			}
			provider.destroy();
			providerRef.current = null;
		};
	}, [url, documentId, token, document, user]);

	return {
		provider: providerRef.current,
		awarenessStates,
		status
	};
}
