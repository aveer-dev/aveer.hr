'use client';

import '@/styles/index.css';

import { Tables } from '@/type/database.types';
import { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { updateDocument } from './document.actions';
import { toast } from 'sonner';
import { DOCUMENT_ACCESS_TYPE } from './types';
import debounce from 'lodash/debounce';
import { generateHslaColors } from '@/lib/utils/colors';
import { DocumentHeader } from './Document/DocumentHeader';
import DocumentEditor from './Document/DocumentEditor';
import { ActiveUsers } from './Document/ActiveUsers';
import { useEditorSetup } from './Document/useEditorSetup';
import { useCollaboration } from './Document/useCollaboration';
import { useDocumentState } from './Document/useDocumentState';

interface PROPS {
	doc: Tables<'documents'>;
	currentUserId?: string;
	fileId?: number;
}

export const Document = ({ doc: initialDoc, currentUserId, fileId }: PROPS) => {
	const { name, updateName, documentName, doc, setDoc, documentState, setDocumentState, contentChanged, setContentChanged, updateDocMetadata, updateDocumentState } = useDocumentState(initialDoc);
	const router = useRouter();
	const pathname = usePathname();

	const resolvedFileId = fileId ?? doc.id;

	const handleBack = useCallback(() => {
		// Force a refresh of the previous page
		const documentsPath = pathname.split('/').slice(0, -1).join('/');
		router.push(documentsPath);
		router.refresh();
	}, [router, pathname]);

	const userPermittedAction = useCallback((): DOCUMENT_ACCESS_TYPE => {
		if (currentUserId == doc.owner) return 'owner';
		const userAccess = (doc.shared_with as unknown as { contract: number; profile: string; access: 'editor' | 'viewer' | 'owner' }[]).find(person => person.profile == currentUserId);
		return userAccess?.access as DOCUMENT_ACCESS_TYPE;
	}, [currentUserId, doc.owner, doc.shared_with]);

	const saveDocument = useCallback(
		async (content: { html: string; json: string }) => {
			if (!currentUserId || doc.locked || doc.signed_lock || !contentChanged || userPermittedAction() == undefined || userPermittedAction() == 'viewer') return;
			updateDocumentState({ isSaving: true, isSaved: false });
			try {
				const result = await updateDocument({
					name: documentName,
					id: doc?.id,
					org: doc.org.subdomain,
					html: content.html,
					json: content.json,
					version: documentState.lastSavedVersion
				});
				if (result.error) throw result.error;
				if (result.data) {
					setDoc(prev =>
						updateDocMetadata(prev, {
							...result.data,
							org: result?.data?.org as any,
							shared_with: (result?.data?.shared_with as any[]) || [],
							version: result?.data?.version as string
						})
					);
					updateDocumentState({
						isSaving: false,
						isSaved: true,
						lastSavedVersion: result.data.version,
						error: null
					});
					setContentChanged(false);
				}
			} catch (error: any) {
				updateDocumentState({ isSaving: false, isSaved: false, error: error.message });
				toast.error(error.message);
			}
		},
		[currentUserId, doc.locked, doc.signed_lock, doc?.id, doc.org.subdomain, contentChanged, userPermittedAction, documentName, documentState.lastSavedVersion, updateDocMetadata, updateDocumentState, setDoc, setContentChanged]
	);

	const debouncedSaveCallback = useMemo(
		() =>
			debounce((content: { html: string; json: string }) => {
				if (contentChanged) {
					saveDocument(content);
				}
			}, 1000),
		[contentChanged, saveDocument]
	);

	const { editor } = useEditorSetup({
		doc,
		userPermittedAction,
		saveDocument,
		debouncedSaveCallback,
		contentChanged,
		documentName,
		setContentChanged
	});

	if (!editor) return null;
	return (
		<section className="relative mx-auto max-w-5xl space-y-4">
			{/* <ActiveUsers users={activeUsers} /> */}

			<div className="relative space-y-6">
				<DocumentHeader name={name} updateName={updateName} doc={doc} documentState={documentState} userPermittedAction={userPermittedAction} currentUserId={currentUserId} onBack={handleBack} setDoc={setDoc} updateDocMetadata={updateDocMetadata} fileId={resolvedFileId} />

				<DocumentEditor editor={editor} doc={doc} userPermittedAction={userPermittedAction} />
			</div>
		</section>
	);
};
