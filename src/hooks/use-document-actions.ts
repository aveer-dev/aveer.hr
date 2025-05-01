import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tables } from '@/type/database.types';
import { deleteDocument, updateDocument } from '@/components/documents/document.actions';

interface UseDocumentActionsProps {
	document: Tables<'documents'>;
	onActionComplete?: () => void;
	onStateChange?: (updates: Partial<Tables<'documents'>>) => void;
}

export const useDocumentActions = ({ document, onActionComplete, onStateChange }: UseDocumentActionsProps) => {
	const router = useRouter();
	const [isDeleting, setDeleteState] = useState(false);
	const [isLocking, setLockState] = useState(false);

	const handleDeleteDocument = async (event?: Event) => {
		event?.preventDefault();

		setDeleteState(true);
		const { error } = await deleteDocument({
			org: (document.org as any)?.subdomain || document.org,
			id: document.id
		});
		setDeleteState(false);

		if (error) return toast.error(error.message);
		router.replace('./');
		onActionComplete?.();
	};

	const handleLockDocument = async (event?: Event) => {
		event?.preventDefault();
		setLockState(true);

		const newLockedState = !document.locked;
		const { error } = await updateDocument({
			org: (document.org as any)?.subdomain || document.org,
			id: document.id,
			locked: newLockedState
		});
		setLockState(false);

		if (error) return toast.error(error.message);
		onStateChange?.({ locked: newLockedState });
		toast.success(`Document ${newLockedState ? 'locked' : 'unlocked'} successfully`);
		router.refresh();
		onActionComplete?.();
	};

	return {
		isDeleting,
		isLocking,
		handleDeleteDocument,
		handleLockDocument
	};
};
