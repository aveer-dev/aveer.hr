import { createClient } from '@/utils/supabase/server';
import { TemplateDoc } from './document';

export const TemplatePageComponant = async ({ org, template }: { org: string; template: string }) => {
	const supabase = await createClient();

	if (template === 'new') return <TemplateDoc />;

	const { data, error } = await supabase.from('templates').select().match({ org, id: template }).single();

	if (error) return <div className="flex h-48 w-full items-center justify-center text-muted-foreground">{error.message}</div>;

	return <TemplateDoc />;
};
