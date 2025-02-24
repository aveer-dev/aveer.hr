import { Body, Head, Html, Preview, Tailwind, Font, Img, Container } from 'react-email';
import * as React from 'react';
import { format } from 'npm:date-fns';
import { Person, CalendarEvent, OrgDetails } from '../_utils/types.ts';

interface NewEventEmailProps {
	person: Person;
	orgDetails?: OrgDetails;
	event: CalendarEvent;
}

export const NewEventEmail = ({ orgDetails, person, event }: EventEmailProps) => {
	const employeeLink = `https://employee.aveer.hr/${orgDetails.subdomain}/${person.id}/home?calendar=${event.id}`;

	// no use case for admin yet
	// const adminLink = `https://${org}.aveer.hr/calendar?event=${event.id}`;

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

				<Preview>{`New event on aveer.hr from ${orgDetails.name} | ${event.summary}`}</Preview>

				<Body>
					<Container>
						<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

						<p className="mb-8 mt-10 text-sm leading-6">Hi {person.profile.first_name}, you have a new scheduled event:</p>

						<ul className="list-none space-y-6 !p-0">
							<li className="m-0">
								<h3>Event title</h3>
								<p>{event.summary}</p>
							</li>

							<li className="m-0">
								<h3>When</h3>
								<p>
									{format(event.start.dateTime, 'PPPP')} | {format(event.start.dateTime, 'p')} - {format(event.end.dateTime, 'p')} ({event.time_zone})
								</p>
							</li>

							<li className="m-0">
								<h3>Attendee{event.attendees.length > 1 && s}</h3>
								<ul className="!p-0">
									{event.attendees.map((attendee, index) => (
										<li key={index}>
											{attendee?.team && `${attendee?.team.name} (Team)`}

											{attendee?.all && 'All employees'}

											{attendee?.single && `${attendee?.single.profile?.first_name} ${attendee?.single.profile?.last_name}, ${attendee?.single.job_title} (${attendee?.single.profile.email})`}
										</li>
									))}
								</ul>
							</li>

							<li className="m-0">
								<h3>Where</h3>
								<p>{event?.location || event?.meeting_link || <span className="italic">Not provided</span>}</p>
							</li>

							<li className="m-0">
								<h3>Additional notes</h3>
								<p>{event?.description || <span className="italic">Not provided</span>}</p>
							</li>
						</ul>

						<p className="mt-6">
							<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href={employeeLink}>
								Open event
							</a>
						</p>

						<p className="text-xs leading-6 text-black">
							If you&apos;re unable to open link, copy link here: <a href={employeeLink}>{employeeLink}</a>
						</p>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
};

export default NewEventEmail;
