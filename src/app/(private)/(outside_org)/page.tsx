import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { PageLoader } from '@/components/ui/page-loader';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserRound, Building2 } from 'lucide-react';

export default async function OrgsPage() {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) redirect('/login');

	const { data, error } = await supabase.from('profiles_roles').select('role, organisations(subdomain)').eq('profile', user.id);
	if (data && data.length) redirect(`http://${data[0].organisations?.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN}/`);

	if (data && !data.length)
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
				<div className="grid gap-3">
					<p className="font-medium">You do not have any organisation, yet. </p>
					<p className="text-xs text-muted-foreground">Or did you mean to access your account as a contractor?</p>
				</div>
				<div className="mx-auto mt-6 flex items-center gap-4">
					<Link className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-4 text-xs')} href={'/contractor'}>
						<UserRound size={12} /> Contractor Contractor Portal
					</Link>
					<Link className={cn(buttonVariants({ size: 'sm' }), 'gap-4 text-xs')} href={'/create-org'}>
						<Building2 size={12} />
						Create Organisation
					</Link>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch organisations available to you</p>
				<div className="mt-6">
					<Link className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }), 'text-xs')} href={'/contractor'}>
						Employee Portal
					</Link>
				</div>
			</div>
		);

	return <PageLoader isLoading />;
}
