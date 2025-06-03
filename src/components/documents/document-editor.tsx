'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { Tables } from '@/type/database.types';
import Editor from './editor';
import { useEditor } from './Document/useEditor';

// --- Main Page ---
export default function DocumentEditor({ dbDoc, profile, currentUserId, provider }: { dbDoc: Tables<'documents'> & { org: { name: string; subdomain: string } }; profile: Tables<'profiles'>; currentUserId: string; provider: HocuspocusProvider }) {
	const { editor, users, userPermittedAction } = useEditor({ provider, dbDoc, profile, currentUserId });

	return editor ? <Editor editor={editor} users={users} userPermittedAction={userPermittedAction} dbDoc={dbDoc} /> : <div>Loading...</div>;
}
