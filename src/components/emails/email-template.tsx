import { Tailwind, Font, Head, Html, Preview, Body } from '@react-email/components';
import { ReactNode } from 'react';

export const EmailContainer = ({ children, preview }: { children: ReactNode; preview: string }) => {
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

				<Preview>{preview}</Preview>

				<Body>{children}</Body>
			</Html>
		</Tailwind>
	);
};
