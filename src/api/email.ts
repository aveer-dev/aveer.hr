import { CreateEmailOptions, CreateEmailResponseSuccess, Resend } from 'resend';

const resend = new Resend(process.env.NEXT_RESEND);

export const sendEmail = async (emailData: CreateEmailOptions): Promise<CreateEmailResponseSuccess | unknown> => {
	try {
		const { data, error } = await resend.emails.send(emailData);
		if (error) return error;

		return data;
	} catch (error) {
		return error;
	}
};
