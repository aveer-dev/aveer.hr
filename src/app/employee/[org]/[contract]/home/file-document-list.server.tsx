import { FileManagementRepository } from '@/dal';
import FileDocumentList from './file-document-list';

export const FileDocumentListServer = async ({ org }: { org: string }) => {
	const repo = new FileManagementRepository();

	// Fetch all files the user has access to, filter for file_type === 'document'
	const { data: files } = await repo.listFiles({ org }, '*, document(*)');
	const documentFiles = (files || []).filter(f => f.file_type === 'document');

	return <FileDocumentList documentFiles={documentFiles} />;
};
