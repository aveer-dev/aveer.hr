'use client';

import { useMemo } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Tables } from '@/type/database.types';
import Editor from './editor';

const url = 'ws://localhost:1234';

// --- Main Page ---
export default function DocumentEditorContainer({ dbDoc, token, profile, currentUserId, fileId }: { dbDoc: Tables<'documents'> & { org: { name: string; subdomain: string } }; token: string; profile: Tables<'profiles'>; currentUserId: string; fileId: number }) {
	// --- Yjs Doc & Provider in state ---

	// Memoize provider so it's only created when its dependencies change
	const provider = useMemo(() => new HocuspocusProvider({ url, name: dbDoc.hocuspocus_doc_id ?? '', token }), [dbDoc.hocuspocus_doc_id, token]);

	// Memoize resolvedFileId
	const resolvedFileId = useMemo(() => fileId ?? dbDoc.id, [fileId, dbDoc.id]);

	// return <Editor provider={provider} document={provider.document} dbDoc={dbDoc} profile={profile} currentUserId={currentUserId} fileId={resolvedFileId} />;
	return (
		<section className="relative mx-auto max-w-5xl space-y-4">
			{/* <ActiveUsers users={activeUsers} /> */}

			<div className="relative space-y-6">
				{/* <DocumentHeader name={name} updateName={updateName} doc={doc} documentState={documentState} userPermittedAction={userPermittedAction} currentUserId={currentUserId} onBack={handleBack} setDoc={setDoc} updateDocMetadata={updateDocMetadata} fileId={resolvedFileId} />

				{editor && <DocumentEditor editor={editor} doc={doc} userPermittedAction={userPermittedAction} />} */}
			</div>
		</section>
	);
}
