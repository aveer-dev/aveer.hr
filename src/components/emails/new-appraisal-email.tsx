import { Img } from '@react-email/components';
import { EmailContainer } from './email-template';
import { Tables } from '@/type/database.types';
import { parseDateOnly } from '@/lib/utils';
import { format } from 'date-fns';

export const NewAppraisalEmail = ({ appraisalCycle, subject }: { appraisalCycle: Tables<'appraisal_cycles'>; subject: string }) => {
	return (
		<EmailContainer preview={subject}>
			<div className="mx-auto my-11 w-full max-w-[4000px]">
				<div className="m-auto w-full max-w-[400px]">
					<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

					<p className="mt-8 text-sm leading-6">A new appraisal cycle has been created in your organization:</p>
					<p className="my-4 text-sm leading-6 text-black">
						<strong>Start Date:</strong> {format(parseDateOnly(appraisalCycle.start_date), 'PPPP')}
					</p>
					<p className="my-4 text-sm leading-6 text-black">
						<strong>End Date:</strong> {format(parseDateOnly(appraisalCycle.end_date), 'PPPP')}
					</p>
					<p className="my-4 text-sm leading-6 text-black">
						<strong>Self Review Due:</strong> {format(parseDateOnly(appraisalCycle.self_review_due_date), 'PPPP')}
					</p>
					<p className="my-4 text-sm leading-6 text-black">
						<strong>Manager Review Due:</strong> {format(parseDateOnly(appraisalCycle.manager_review_due_date), 'PPPP')}
					</p>

					<p className="mb-4 mt-8 text-sm leading-6 text-black">Please log in to your dashboard to view more details and manage this appraisal cycle.</p>
					<p className="my-4 text-sm leading-6 text-black">This is an automated notification from Aveer.hr</p>

					<p className="text-xs leading-6 text-black">
						If you&apos;re unable to open link, copy link here: <a href={`https://${appraisalCycle.org}.aveer.hr`}>https://{appraisalCycle.org}.aveer.hr</a>
					</p>
				</div>
			</div>
		</EmailContainer>
	);
};

export default NewAppraisalEmail;
