// deno-lint-ignore no-unused-vars
import * as React from 'react';
import { Body, Head, Heading, Html, Preview, Section, Text, Hr, Tailwind, Font, Img, Container } from 'react-email';
import { format } from 'date-fns';

interface AppraisalEmailProps {
	recipientName: string;
	appraisalName: string;
	appraisalDescription?: string;
	startDate: string;
	endDate: string;
	selfReviewDueDate: string;
	managerReviewDueDate: string;
	emailType: string;
	orgName?: string;
}

export const AppraisalEmail = ({ recipientName, appraisalName, appraisalDescription, startDate, endDate, selfReviewDueDate, managerReviewDueDate, emailType, orgName = 'Aveer.hr' }: AppraisalEmailProps) => {
	const getEmailContent = () => {
		switch (emailType) {
			case 'appraisal_start_reminder_admin':
				return {
					subject: `Appraisal Cycle Starting Tomorrow: ${appraisalName}`,
					title: 'Appraisal Cycle Starting Tomorrow',
					message: `The appraisal cycle "${appraisalName}" starts tomorrow. Please ensure all preparations are in place.`
				};
			case 'appraisal_start_reminder_all':
				return {
					subject: `Appraisal Cycle Starting Today: ${appraisalName}`,
					title: 'Appraisal Cycle Starting Today',
					message: `The appraisal cycle "${appraisalName}" starts today. Please begin your participation.`
				};
			case 'self_review_reminder_day_before':
				return {
					subject: `Self Review Due Tomorrow: ${appraisalName}`,
					title: 'Self Review Due Tomorrow',
					message: `Your self review for the appraisal cycle "${appraisalName}" is due tomorrow. Please complete it on time.`
				};
			case 'self_review_reminder_day_of':
				return {
					subject: `Self Review Due Today: ${appraisalName}`,
					title: 'Self Review Due Today',
					message: `Your self review for the appraisal cycle "${appraisalName}" is due today. Please complete it before the deadline.`
				};
			case 'manager_review_reminder_day_before':
				return {
					subject: `Manager Review Due Tomorrow: ${appraisalName}`,
					title: 'Manager Review Due Tomorrow',
					message: `Manager reviews for the appraisal cycle "${appraisalName}" are due tomorrow. Please complete all pending reviews.`
				};
			case 'manager_review_reminder_day_of':
				return {
					subject: `Manager Review Due Today: ${appraisalName}`,
					title: 'Manager Review Due Today',
					message: `Manager reviews for the appraisal cycle "${appraisalName}" are due today. Please complete all pending reviews.`
				};
			case 'appraisal_end_reminder_admin':
				return {
					subject: `Appraisal Cycle Ending Today: ${appraisalName}`,
					title: 'Appraisal Cycle Ending Today',
					message: `The appraisal cycle "${appraisalName}" ends today. Please ensure all reviews are completed.`
				};
			default:
				return {
					subject: `Appraisal Reminder: ${appraisalName}`,
					title: 'Appraisal Reminder',
					message: `This is a reminder about the appraisal cycle "${appraisalName}".`
				};
		}
	};

	const content = getEmailContent();

	return (
		<Tailwind
			config={{
				theme: {
					extend: {
						colors: {
							brand: '#007291'
						}
					}
				}
			}}>
			<Html lang="en">
				<Head>
					<Font
						fontFamily={`"Karla", system-ui`}
						fallbackFontFamily="Verdana"
						webFont={{
							url: 'https://fonts.googleapis.com/css2?family=Karla&display=swap',
							format: 'woff2'
						}}
						fontWeight={400}
						fontStyle="normal"
					/>
				</Head>
				<Preview>{content.subject}</Preview>

				<Body className="bg-white">
					<Container className="mx-auto my-11 w-full max-w-[4000px]">
						<Container className="m-auto w-full max-w-[400px]">
							<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

							<Heading level={2} className="mt-8 text-base">
								Hello {recipientName},
							</Heading>
							<Text className="my-5 text-sm leading-6">{content.message}</Text>

							{appraisalDescription && (
								<Section className="my-8">
									<Text className="text-sm leading-6 text-black">
										<strong>Description:</strong> {appraisalDescription}
									</Text>
								</Section>
							)}

							<Section className="my-8">
								<Text className="text-sm leading-6 text-black">
									<strong>Appraisal Cycle Details:</strong>
								</Text>
								<Text className="my-4 text-sm leading-6 text-black">
									<strong>Start Date:</strong> {format(new Date(startDate).toLocaleDateString(), 'PPPP')}
								</Text>
								<Text className="my-4 text-sm leading-6 text-black">
									<strong>End Date:</strong> {format(new Date(endDate).toLocaleDateString(), 'PPPP')}
								</Text>
								<Text className="my-4 text-sm leading-6 text-black">
									<strong>Self Review Due:</strong> {format(new Date(selfReviewDueDate).toLocaleDateString(), 'PPPP')}
								</Text>
								<Text className="my-4 text-sm leading-6 text-black">
									<strong>Manager Review Due:</strong> {format(new Date(managerReviewDueDate).toLocaleDateString(), 'PPPP')}
								</Text>
							</Section>

							<Hr className="mx-0 my-8 w-full border border-solid border-[#eaeaea]" />

							<Text className="text-sm leading-6 text-[#666666]">
								This email was sent by {orgName} regarding the appraisal cycle &quot;{appraisalName}&quot;.
							</Text>
						</Container>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
};

export default AppraisalEmail;
