'use server';

import { Tables, TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/api/email';
import { SignatureRequestEmail } from '@/components/emails/signature-request';
import { revalidatePath } from 'next/cache';

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

export const createDocument = async (document: TablesInsert<'documents'>) => {
	const supabase = await createClient();

	const response = await supabase.from('documents').insert(document).select().single();

	return response;
};

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
