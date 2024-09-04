'use server';

import { CreateEmailOptions, CreateEmailResponse, Resend } from 'resend';

const resend = new Resend(process.env.NEXT_RESEND);

export const sendEmail = async (emailData: CreateEmailOptions): Promise<CreateEmailResponse> => {
	const response = await resend.emails.send(emailData);
	return response;
};
