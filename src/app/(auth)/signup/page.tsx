import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Welcome</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Enter your details below to setup your organisation account</p>
			</div>

			<div className="grid gap-6">
				<div className="grid grid-cols-2 items-center gap-6">
					<div className="grid gap-3">
						<Label htmlFor="first-name">First name</Label>
						<Input id="first-name" type="text" placeholder="First name here" required />
					</div>

					<div className="grid gap-3">
						<Label htmlFor="last-name">Last name</Label>
						<Input id="last-name" type="text" placeholder="Last name here" required />
					</div>
				</div>

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

				<div className="flex w-full items-center justify-end gap-4">
					<Link href="/login" className="text-xs">
						Login
					</Link>
					<Button type="submit" size={'sm'} className="px-10 text-sm font-light">
						Signup
					</Button>
				</div>
			</div>
		</div>
	);
}
