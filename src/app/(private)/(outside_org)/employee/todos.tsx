import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/utils/supabase/server';

export const Todos = async ({ profileId }: { profileId?: string }) => {
	const supabase = createClient();

	if (!profileId) return;

	const { data, error } = await supabase.from('profiles').select().eq('id', profileId).single();

	const profileTodos: { label: string; id: string; done: boolean }[] = [
		{ id: 'basic', label: 'Provide basic information', done: true },
		{ id: 'emergency', label: 'Provide emergency contact', done: true },
		{ id: 'address', label: 'Provide physical address', done: true },
		{ id: 'medical', label: 'Provide medical details', done: true }
	];
	if (data && (!data.nationality || !data.email || !data.gender || !data.mobile)) profileTodos[0].done = false;
	if (data && !data.emergency_contact) profileTodos[1].done = false;
	if (data && !data.address) profileTodos[2].done = false;
	if (data && !data.medical) profileTodos[3].done = false;

	return (
		<section>
			<h2 className="mb-4 ml-2 text-sm font-normal text-support">Todos</h2>

			<div className="flex overflow-hidden rounded-3xl bg-muted/60 p-4">
				<ul className="max-h-72 min-h-72 w-full max-w-[16rem] space-y-1 overflow-y-auto rounded-2xl bg-background px-8 py-4 text-sm drop-shadow-sm">
					<li className="flex justify-between rounded-md bg-muted/30 p-2 px-3 py-3 transition-all duration-500 hover:bg-muted/30">
						Profile <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">{profileTodos.length}</span>
					</li>
				</ul>

				<div className="max-h-72 w-full overflow-auto py-4">
					<div className="mx-auto max-w-96">
						<h3 className="mb-2 text-base font-semibold">Profile todos</h3>

						<ul className="space-y-4">
							{profileTodos.map(todo => (
								<li key={todo.id} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
									<div className="flex gap-3">
										<Checkbox /> {todo.label}
									</div>
									<ChevronRight size={12} />
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};
