'use server';

import { CreateBatchOptions, CreateBatchResponse, CreateEmailOptions, CreateEmailResponse, Resend } from 'resend';

const resend = new Resend(process.env.NEXT_RESEND);

export const sendEmail = async (emailData: CreateEmailOptions): Promise<CreateEmailResponse> => {
	const response = await resend.emails.send(emailData);
	return response;
};

export const sendBulkEmail = async (emailData: CreateBatchOptions): Promise<CreateBatchResponse> => {
	const response = await resend.batch.send(emailData);
	return response;
};
