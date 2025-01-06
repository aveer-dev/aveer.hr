'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useActionState, useEffect, useState } from 'react';
import { TextLoop } from '@/components/ui/text-loop';
import { createClient } from '@/utils/supabase/client';

interface props {
	loginAction: (prevState: any, payload: FormData) => Promise<string>;
}

const supabase = createClient();

export const LoginForm = ({ loginAction }: props) => {
	const [state, formAction, pending] = useActionState(loginAction, '');
	const [buttonAnimationIndex, setButtonAnimationIndex] = useState(0);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [direction, setDirection] = useState(-1);

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

	const loginWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',

			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/signin-callback`,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				}
			}
		});
	};

	return (
		<form className="grid gap-4" action={formAction}>
			<div className="grid gap-3">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					inputMode="email"
					name="email"
					placeholder="m@example.com"
					value={email}
					onChange={e => {
						setEmail(e.target.value);

						if (e.target.value.length > 0 && password.length > 0) {
							setButtonAnimationIndex(1);
							setDirection(1);
						} else {
							setButtonAnimationIndex(0);
							setDirection(-1);
						}
					}}
					required
				/>
			</div>

			<div className="grid gap-3">
				<div className="flex items-center">
					<Label htmlFor="password">Password</Label>
					<Link href="/forgot-password" className="ml-auto inline-block text-xs underline">
						Forgot?
					</Link>
				</div>

				<Input
					id="password"
					type="password"
					name="password"
					placeholder="enter password"
					value={password}
					onChange={e => {
						setPassword(e.target.value);
						if (e.target.value.length > 0 && email.length > 0) {
							setButtonAnimationIndex(1);
							setDirection(1);
						} else {
							setButtonAnimationIndex(0);
							setDirection(-1);
						}
					}}
					required
				/>
			</div>

			<TextLoop
				className="!mt-4 w-full"
				activeIndex={buttonAnimationIndex}
				transition={{
					type: 'spring',
					stiffness: 150,
					damping: 19,
					mass: 1.2
				}}
				variants={{
					initial: {
						y: -direction * 20,
						rotateX: -direction * 90,
						opacity: 0,
						filter: 'blur(4px)'
					},
					animate: {
						y: 0,
						rotateX: 0,
						opacity: 1,
						filter: 'blur(0px)'
					},
					exit: {
						y: -direction * 20,
						rotateX: -direction * 90,
						opacity: 0,
						filter: 'blur(4px)'
					}
				}}>
				<Button onClick={loginWithGoogle} type="button" disabled={pending} size={'sm'} className="w-full gap-3 px-4 text-xs font-light">
					<svg width="24" height="24" viewBox="0 0 24 24" className="scale-75 fill-secondary" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M21.6031 10.2H12.2031V13.9H17.7031C17.6031 14.8 17.0031 16.2 15.7031 17.1C14.9031 17.7 13.7031 18.1 12.2031 18.1C9.60313 18.1 7.30313 16.4 6.50313 13.9C6.30313 13.3 6.20312 12.6 6.20312 11.9C6.20312 11.2 6.30313 10.5 6.50313 9.9C6.60313 9.7 6.60312 9.5 6.70312 9.4C7.60312 7.3 9.70312 5.8 12.2031 5.8C14.1031 5.8 15.3031 6.6 16.1031 7.3L18.9031 4.5C17.2031 3 14.9031 2 12.2031 2C8.30312 2 4.90312 4.2 3.30312 7.5C2.60312 8.9 2.20312 10.4 2.20312 12C2.20312 13.6 2.60312 15.1 3.30312 16.5C4.90312 19.8 8.30312 22 12.2031 22C14.9031 22 17.2031 21.1 18.8031 19.6C20.7031 17.9 21.8031 15.3 21.8031 12.2C21.8031 11.4 21.7031 10.8 21.6031 10.2Z"
							strokeWidth="1.5"
							strokeMiterlimit="10"
							strokeLinecap="round"
							strokeLinejoin="round"></path>
					</svg>
					Login with Google
				</Button>

				<Button type="submit" disabled={pending} size={'sm'} className="w-full gap-3 px-4 text-xs font-light">
					{pending && <LoadingSpinner />}
					{pending ? 'Logging in' : 'Login'}
				</Button>
			</TextLoop>
		</form>
	);
};
