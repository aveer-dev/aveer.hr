import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';
import { FileWithAccess, FolderWithAccess } from '@/dal/interfaces/file-management.types';

interface props {
	senderName: string;
	receiver: { id: string | number; name: string };
	org?: { name: string; subdomain: string };
	from: string;
	to: string;
	file: { access_level: string; name: string };
	message?: string;
}

export const DocumentInviteEmail = ({ senderName, org, receiver, file, message }: props) => {
	const link = `https://employee.aveer.hr/${org?.subdomain ?? ''}/${receiver.id}/files`;

	return (
		<EmailContainer preview={`${org?.name ?? 'Aveer.hr'} | You have a new document invite`}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<h2 className="mt-8 text-base">Hi {senderName}</h2>
					<p className="my-5 text-sm leading-6">
						{receiver.name} has just invited you with a &quot;{file.access_level}&quot; access to {file.name}.
					</p>

					{message && (
						<div className="rounded-md bg-muted p-2 text-sm">
							<p>{message}</p>
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
