import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';

interface props {
	senderName: string;
	receiver: { id: string | number; name: string };
	org: { name: string; subdomain: string } | string;
	file: { access_level: string; name: string };
	message?: string;
}

export const DocumentInviteEmail = ({ senderName, org, receiver, file, message }: props) => {
	const link = `https://employee.aveer.hr/${typeof org === 'string' ? org : org?.subdomain}/files`;

	return (
		<EmailContainer preview={`${typeof org === 'string' ? org : (org?.name ?? 'Aveer.hr')} | You have a new document invite`}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" className="max-w-28" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<h2 className="mt-8 text-base">Hi {receiver.name}</h2>
					<p className="my-5 text-sm leading-6">
						{senderName} has just invited you with a &quot;{file.access_level}&quot; access to {file.name}.
					</p>

					{message && (
						<div className="min-h-44 w-full rounded-md bg-gray-100 bg-muted px-4 py-2 text-sm">
							<h3 className="text-xs font-medium text-gray-400">Invite message</h3>
							<p className="mt-3 text-sm">{message}</p>
						</div>
					)}

					<p className="my-5 text-sm leading-6">Click button or link below to open Aveer.hr.</p>

					<p>
						<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href={link}>
							Open files on Aveer.hr
						</a>
					</p>

					<p className="text-xs leading-6 text-black">
						If you&apos;re unable to open link, copy link here: <a href={link}>{link}</a>
					</p>
				</div>
			</div>
		</EmailContainer>
	);
};

export default DocumentInviteEmail;

DocumentInviteEmail.PreviewProps = {
	senderName: 'Emmanuel',
	receiver: { id: '123', name: 'John Doe' },
	org: 'emmy',
	type: 'admin',
	contract: 3
};
