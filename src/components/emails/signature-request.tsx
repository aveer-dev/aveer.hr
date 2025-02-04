import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';
import { format } from 'date-fns';

export const SignatureRequestEmail = ({ orgName, docName }: { orgName?: string; docName: string }) => {
	return (
		<EmailContainer preview={`Your contract at ${orgName || 'an organisation'} has been scheduled for termination`}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<h2 className="mt-8 text-base">Hi there</h2>
					<p className="my-5 text-sm leading-6">
						{orgName || 'An organisation'} on aveer.hr has quested for your signature on a document {docName}. Click button below to review document and sign.
					</p>
					<p>
						<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href="https://employee.aveer.hr">
							Review document
						</a>
					</p>
					<p className="text-xs leading-6 text-black">
						If you&apos;re unable to open link, copy link here: <a href="https://employee.aveer.hr">https://employee.aveer.hr</a>
					</p>
				</div>
			</div>
		</EmailContainer>
	);
};
