// This hook will manage Yjs document, IndexeddbPersistence, WebrtcProvider, and active users (awareness)

import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import * as awarenessProtocol from 'y-protocols/awareness';

interface User {
	name: string;
	color: string;
	id: string;
}

interface AwarenessState {
	user?: User;
	[key: string]: any;
}

export const useCollaboration = (docId: string, currentUser: User | null) => {
	const ydoc = useRef<Y.Doc | null>(null);
	const [provider, setProvider] = useState<IndexeddbPersistence | null>(null);
	const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(null);
	const [activeUsers, setActiveUsers] = useState<User[]>([]);

	useEffect(() => {
		if (typeof window === 'undefined' || ydoc.current) return;

		const initCollaboration = async () => {
			try {
				ydoc.current = new Y.Doc();
				const newProvider = new IndexeddbPersistence(`document-${docId}`, ydoc.current);
				await new Promise<void>(resolve => newProvider.once('synced', () => resolve()));
				setProvider(newProvider);

				const rtcProvider = new WebrtcProvider(`document-${docId}`, ydoc.current, {
					awareness: new awarenessProtocol.Awareness(ydoc.current)
				});

				rtcProvider.awareness.setLocalState({ user: currentUser });

				rtcProvider.awareness.on('change', () => {
					const states = Array.from(rtcProvider.awareness.getStates().values());
					const users = states
						.filter((state: unknown): state is AwarenessState => {
							const awarenessState = state as AwarenessState;
							return awarenessState?.user !== undefined;
						})
						.map(state => state.user as User)
						.filter((user): user is User => user !== undefined);
					setActiveUsers(users);
				});

				setWebrtcProvider(rtcProvider);
			} catch (error) {
				console.error('Failed to initialize collaboration:', error);
			}
		};

		if (currentUser) {
			initCollaboration();
		}

		return () => {
			provider?.destroy();
			webrtcProvider?.destroy();
			ydoc.current?.destroy();
			ydoc.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [docId, provider, currentUser, webrtcProvider]);

	return {
		ydoc,
		provider,
		webrtcProvider,
		activeUsers
	};
};
