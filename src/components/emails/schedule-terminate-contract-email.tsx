import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';
import { format } from 'date-fns';

export const ScheduleTerminationContractEmail = ({ orgName, endDate }: { orgName?: string; endDate: string }) => {
	return (
		<EmailContainer preview={`Your contract at ${orgName || 'an organisation'} has been scheduled for termination`}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<h2 className="mt-8 text-base">Hi there</h2>
					<p className="my-5 text-sm leading-6">
						{orgName || 'An organisation'} on aveer.hr has scheduled for your contract to be terminated on {format(endDate, 'PPP')}. Your account, interaction history, contract details with {orgName || 'the organisation'}, as well as your contracts with other
						organisations are still and will still be available on aveer.hr even after termination date.
					</p>
					<p>
						<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href="https://employee.aveer.hr">
							View account
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

export default ScheduleTerminationContractEmail;

ScheduleTerminationContractEmail.PreviewProps = {
	orgName: 'Emmy',
	endDate: new Date()
};
