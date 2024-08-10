import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export const OrgsList = async () => {
	const supabase = createClient();

	const { data, error } = await supabase.from('profiles_roles').select('role, organisations(id)');
	if (error) toast.error(error.message);
	if (data && data.length) redirect(`/${data[0].organisations?.id}`);
	if (data && !data.length) redirect(`/contractor`);

	return <></>;
};
