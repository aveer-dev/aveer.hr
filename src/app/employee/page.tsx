import { buttonVariants } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { Link, Undo2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ContractorPage() {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();

	if (!user || userError) return redirect('/app/login');

	const { data, error } = await supabase.from('contracts').select().eq('profile', user.id);

	if (data && data.length) return redirect(`/employee/${data[0].org}/${data[0].id}/home`);

	if (error || !data || !data.length) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground">
				<p>Unable to fetch contracts</p>
				<p>{error?.message}</p>

				<Link href={'/app/login'} className={cn(buttonVariants(), 'mt-6 gap-4')}>
					<Undo2 size={12} />
					Go to login
				</Link>
			</div>
		);
	}

	return <PageLoader isLoading={true} />;
}
