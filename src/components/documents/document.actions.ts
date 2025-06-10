'use server';

import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/api/email';
import { SignatureRequestEmail } from '@/components/emails/signature-request';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { FileManagementRepository } from '@/dal/repositories/file-management.repository';
import { File, FileType } from '@/dal/interfaces/file-management.types';

export const updateDocument = async (payload: TablesUpdate<'documents'>) => {
	const supabase = await createClient();

	const response = await supabase
		.from('documents')
		.update({ ...payload, updated_at: new Date().toISOString() })
		.match({ org: payload.org, id: payload.id })
		.select('*, org(subdomain, name)');

	// Revalidate the documents list page and the current document page
	revalidatePath('/documents');
	revalidatePath(`/documents/${payload.id}`);

	return { data: response.data ? response.data[0] : null, error: response.error };
};

export const deleteDocument = async ({ org, id }: { org: string; id: number }) => {
	const supabase = await createClient();
	const response = await supabase.from('documents').delete().match({ org, id });
	return response;
};

// export const createDocument = async (document: TablesInsert<'documents'>) => {
// 	const supabase = await createClient();

// 	const response = await supabase.from('documents').insert(document).select().single();

// 	return response;
// };

export const sendToSignatories = async ({ org, signatures, id, emails, name, orgName }: { orgName: string; id: number; org: string; signatures: any[]; emails: string[]; name: string }) => {
	const supabase = await createClient();
	const { error } = await supabase.from('documents').update({ signatures, locked: true, signed_lock: true }).match({ org, id });
	if (error) throw error;

	// await sendEmail({
	// 	to: emails,
	// 	subject: `Signature request: ${name}`,
	// 	from: 'Aveer.hr <contract@notification.aveer.hr>',
	// 	react: SignatureRequestEmail({ orgName, docName: name })
	// });

	return;
};

export const duplicateAndSendToSignatories = async ({ signatures, emails, document, newDocName }: { document: Tables<'documents'>; signatures: any[]; emails: string[]; newDocName: string }) => {
	const { data: newDoc, error: newDocError } = await createDocument({
		document: {
			org: (document.org as any).subdomain,
			html: document.html,
			owner: document.owner,
			owner_employee: document.owner_employee,
			shared_with: document.shared_with,
			name: newDocName,
			template: document.template,
			locked: true,
			signed_lock: true,
			parent_id: document.id,
			signatures
		}
	});
	if (newDocError) throw newDocError;

	// await sendEmail({
	// 	to: emails,
	// 	subject: `Signature request: ${newDocName}`,
	// 	from: 'Aveer.hr <contract@notification.aveer.hr>',
	// 	react: SignatureRequestEmail({ orgName: (document.org as any).name, docName: newDocName })
	// });

	return newDoc;
};

export const createDocument = async ({ document, org, ownedBy = 'employee' }: { document?: TablesInsert<'documents'>; org?: string; ownedBy?: 'employee' | 'organisation' }) => {
	if (!document && !org) return { data: null, error: { message: 'Document or org payload required to create document', status: 500 } };

	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) return redirect('/app/login');

	let payload: TablesInsert<'documents'> = { org: '' };
	if (document) payload = document;
	if (org) payload = { org, shared_with: [{ profile: user.id, access: 'owner' }], name: `New Document - ${format(new Date(), 'PPP')}` };

	const res = await supabase.from('documents').insert(payload).select().single();

	if (res.error || !res.data) return res;

	// Create a file record for the new document
	const fileRepo = new FileManagementRepository();
	const filePayload: TablesInsert<'files'> = {
		name: res.data.name,
		org: res.data.org,
		owner_id: ownedBy == 'employee' ? user.id : ((org || document?.org) as string),
		owner_type: ownedBy,
		file_type: 'document' as FileType,
		document: res.data.id,
		entity: res.data.entity ?? null,
		folder: null,
		storage_url: null,
		created_by: user.id
	};
	const fileRes = await fileRepo.createFile(filePayload);

	return { ...res, file: fileRes };
};
