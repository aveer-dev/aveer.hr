import { Tailwind, Font, Head, Html, Body, Preview, Img } from '@react-email/components';

export const NewContractEmail = () => {
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
						fontFamily="Roboto"
						fallbackFontFamily="Verdana"
						webFont={{
							url: 'https://fonts.googleapis.com/css2?family=Karla&display=swap',
							format: 'woff2'
						}}
						fontWeight={400}
						fontStyle="normal"
					/>
				</Head>
				<Preview>You have a new contract on aveer</Preview>

				<Body>
					<div className="mx-auto my-11 w-full max-w-[4000px]">
						<div className="m-auto w-full max-w-[400px]">
							<Img width="100" src="https://byprsbkeackkgjsjlcgp.supabase.co/storage/v1/object/public/platform%20assets/logo/aveer-text.png" alt="aveer logo" />

							<h2 className="mt-8 text-base">Hi there</h2>
							<p className="my-5 text-sm">An organisation on aveer.hr sent you a contract offer. Please click the button below to review and sign if you&apos;re interested in going ahead with it:</p>
							<p>
								<a className="my-6 block w-full min-w-52 rounded-md bg-black py-3 text-center text-sm text-white no-underline" href="https://employee.aveer.hr">
									View contract
								</a>
							</p>
							<p className="text-xs leading-5 text-black">
								If you&apos;re unable to open link, copy link here: <a href="https://employee.aveer.hr">https://employee.aveer.hr</a>
							</p>
						</div>
					</div>
				</Body>
			</Html>
		</Tailwind>
	);
};
