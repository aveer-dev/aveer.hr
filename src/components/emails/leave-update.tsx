import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';

interface props {
	status: string;
	name: string;
	org: { name: string; subdomain: string };
	contract?: number;
	from: string;
	to: string;
	leaveType: string;
}

export const LeaveRequestEmail = ({ name, org, contract, from, to, status, leaveType }: props) => {
	const link = `https://employee.aveer.hr/${org.subdomain}/${contract}/leave/`;

	return (
		<EmailContainer preview={`${org.name} | You have a new leave request`}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<h2 className="mt-8 text-base">Hi {name}</h2>
					<p className="my-5 text-sm leading-6">
						Your {leaveType} leave request has been {status}.
					</p>

					<ul className="-ml-4 text-sm">
						<li className="mb-4">
							From <span className="font-semibold">{from}</span>
						</li>
						<li>
							To <span className="font-semibold">{to}</span>
						</li>
					</ul>

					<p className="my-5 text-sm leading-6">Click button or link below to review leave request details.</p>

					<p>
						<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href={link}>
							Review leave details
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

export default LeaveRequestEmail;

LeaveRequestEmail.PreviewProps = {
	name: 'Emmanuel',
	org: 'emmy',
	type: 'admin',
	contract: 3
};
