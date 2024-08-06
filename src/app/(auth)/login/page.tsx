import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="grid gap-2 mb-4">
				<h1 className="text-xl font-bold">Login</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Enter your email below to login to your account</p>
			</div>

			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" placeholder="m@example.com" required />
				</div>

				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
						<Link href="/forgot-password" className="ml-auto inline-block text-xs underline">
							Forgot?
						</Link>
					</div>
					<Input id="password" type="password" required />
				</div>

				<div className="flex justify-end items-center w-full gap-4">
					<Link href="/signup" className="text-xs">
						Sign up
					</Link>
					<Button type="submit" size={'sm'} className="text-sm font-light px-10">
						Login
					</Button>
				</div>
			</div>
		</div>
	);
}
