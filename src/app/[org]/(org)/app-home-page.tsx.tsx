import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserRound, Building2 } from 'lucide-react';

export default async function AppHomePage() {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	const [{ data, error }, { data: contracts }] = await Promise.all([
		await supabase.from('profiles_roles').select('role, organisation').match({ profile: user?.id, disable: false }),
		await supabase
			.from('contracts')
			.select('id, org')
			.eq('profile', user?.id || '')
	]);

	if (data && !data.length) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
				<div className="grid gap-3">
					<p className="font-medium">You do not have any organisation, yet. </p>
					<p className="text-xs text-muted-foreground">Or did you mean to access your account as an employee?</p>
				</div>

				<div className="mx-auto mt-6 flex items-center gap-4">
					<Link className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-4 text-xs')} href={'/employee'}>
						<UserRound size={12} /> Employee Portal
					</Link>
					<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={'/app/create-org'}>
						<Building2 size={12} />
						Create Organisation
					</Link>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch organisations available to you</p>
				<div className="mt-6">
					<Link className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), 'text-xs')} href={'/employee'}>
						Employee Portal
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
			<div className="grid gap-3">
				<p className="font-medium">Hi {user?.user_metadata.first_name}, welcome onboard.</p>
				<p className="text-xs text-muted-foreground">Get started or continue with your account.</p>
			</div>

			<div className="mx-auto mt-6 flex items-center gap-4">
				{contracts && contracts.length > 0 && (
					<Link className={cn(buttonVariants({ size: 'sm', variant: data.length ? 'outline' : 'default' }), 'gap-4 text-xs')} href={`/employee/${contracts[0].org}/${contracts[0].id}/home`}>
						<UserRound size={12} /> Employee Platform
					</Link>
				)}

				{data && data.length > 0 && (
					<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? `http://${data[0].organisation}.${process.env.NEXT_PUBLIC_DOMAIN}/` : `/${data[0].organisation}`}>
						<Building2 size={12} />
						Admin Platform
					</Link>
				)}

				{data && data.length == 0 && (
					<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={'/app/create-org'}>
						<Building2 size={12} />
						Create Organisation
					</Link>
				)}
			</div>
		</div>
	);
}
