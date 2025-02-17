import { Body, Head, Html, Preview, Tailwind, Font, Img } from 'react-email';
import * as React from 'react';

interface NotificationEmailProps {
	name: string;
	link: string;
	title: string;
	body: string;
	type: string;
	org: string;
	contract?: number;
}

export const NotificationEmail = ({ name, link, title, body, type, org, orgDetails, contract }: NotificationEmailProps) => {
	const employeeLink = `https://employee.aveer.hr/${org}/${contract}${link}`;
	const adminLink = `https://${org}.aveer.hr${link}`;

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

				<Preview>{title}</Preview>

				<Body>
					<div className="mx-auto my-11 w-full max-w-[4000px]">
						<div className="m-auto w-full max-w-[400px]">
							<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

							<h2 className="mt-8 text-base">Hi {name}</h2>
							<p className="my-5 text-sm leading-6">{body}</p>
							<p>
								<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href={type == 'admin' ? adminLink : employeeLink}>
									Open notification
								</a>
							</p>
							<p className="text-xs leading-6 text-black">
								If you&apos;re unable to open link, copy link here: <a href={type == 'admin' ? adminLink : employeeLink}>{type == 'admin' ? adminLink : employeeLink}</a>
							</p>
						</div>
					</div>
				</Body>
			</Html>
		</Tailwind>
	);
};

export default NotificationEmail;
