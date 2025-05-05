// This hook will manage document state, saving, debounced save, etc.

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import debounce from 'lodash/debounce';
import { updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { DocumentMetadata, DocumentState } from '../types';
import { Tables } from '@/type/database.types';

export const useDocumentState = (initialDoc: any, currentUserId: string | undefined, employees: any) => {
	// State: name, documentName, doc, documentState, contentChanged
	// Logic: updateDocMetadata, updateDocumentState, saveDocument, debouncedSaveCallback
	// Return all state and handlers needed by the main Document component

	const [name, updateName] = useState(initialDoc?.name);
	const [documentName] = useDebounce(name, 1000);
	const [doc, setDoc] = useState<DocumentMetadata>({
		...initialDoc,
		org: initialDoc.org as any,
		shared_with: (initialDoc?.shared_with as any) || [],
		version: initialDoc.version as string
	});

	const [documentState, setDocumentState] = useState<DocumentState>({
		isSaving: false,
		isSaved: true,
		lastSavedVersion: (initialDoc.version as string) || null,
		error: null
	});

	const [contentChanged, setContentChanged] = useState(false);

	const updateDocMetadata = useCallback((prev: DocumentMetadata, updates: Partial<Tables<'documents'>>) => {
		return {
			...prev,
			...updates,
			org: {
				subdomain: typeof updates.org === 'string' ? updates.org : prev.org.subdomain
			},
			shared_with: prev.shared_with,
			signed_lock: updates.signed_lock ?? prev.signed_lock,
			private: updates.private ?? prev.private
		} as DocumentMetadata;
	}, []);

	const updateDocumentState = useCallback((updates: Partial<DocumentState>) => {
		setDocumentState(prev => ({
			...prev,
			...updates
		}));
	}, []);

	// saveDocument and debouncedSaveCallback will be set up in the main component, since they depend on more context (editor, userPermittedAction, etc.)

	return {
		name,
		updateName,
		documentName,
		doc,
		setDoc,
		documentState,
		setDocumentState,
		contentChanged,
		setContentChanged,
		updateDocMetadata,
		updateDocumentState
	};
};
