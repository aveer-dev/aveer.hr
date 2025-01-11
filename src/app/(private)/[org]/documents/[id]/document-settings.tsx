'use client';

import { AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Tables } from '@/type/database.types';
import { Trash2 } from 'lucide-react';
import { updateDocument } from '../document.actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
	private: z.boolean().default(true).optional(),
	editors: z.string().array()
});

export const DocumentSettings = ({ adminUsers, editorIds, docId, org, owner, currentUserId }: { adminUsers?: Tables<'profiles_roles'>[] | null; editorIds?: string[]; org: string; docId: number; owner: string; currentUserId: string }) => {
	const [usersSearchResult, setUsersSearchResult] = useState<Tables<'profiles_roles'>[]>([]);
	const [editors, updateEditors] = useState(adminUsers?.filter(user => !!editorIds?.find(editor => (user.profile as any)?.id == editor)) || []);
	const [adminUsersList, updateAdminUsersList] = useState<Tables<'profiles_roles'>[]>([]);
	const [isUpdating, setUpdateState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			private: true,
			editors: editors.map(editor => (editor.profile as any)?.id) || []
		}
	});

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		setUpdateState(true);

		const { error } = await updateDocument({ private: data.private, editors: data.editors, id: docId, org });
		setUpdateState(false);
		if (error) return toast.error(error.message);

		toast.success('Document settings updated successfully');
		const currentUserRemoved = !editors.find(editor => (editor.profile as any)?.id == currentUserId);
		if (currentUserRemoved) router.push('./');
		router.refresh();
	};

	const searchPeople = (query: string, keys?: (keyof Tables<'profiles'>)[]) => {
		if (!query) return [];

		const searchTerm = query.toLowerCase();

		return adminUsersList?.filter(user => {
			const profile: Tables<'profiles'> = user.profile as any;

			if (!keys) return Object.values(profile).some(value => String(value).toLowerCase().includes(searchTerm));
			else return keys.some(key => String(profile[key]).toLowerCase().includes(searchTerm));
		});
	};

	useEffect(() => {
		form.setValue(
			'editors',
			editors.map(editor => (editor.profile as any).id)
		);
		updateAdminUsersList(adminUsers?.filter(user => !editors?.find(editor => user?.id == editor.id)) || []);
		setUsersSearchResult(result => result?.filter(user => !editors?.find(editor => user?.id == editor.id)) || []);
	}, [adminUsers, editors, form]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
				<div>
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="private"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel className="text-sm font-normal">Private</FormLabel>
										<FormDescription>Make this document only visible to you.</FormDescription>
									</div>
									<FormControl>
										<Switch className="scale-75" checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="space-y-3">
							<Label>Editors</Label>
							<Command className="rounded-lg border md:min-w-[450px]" shouldFilter={false}>
								<CommandInput
									placeholder="Type an admin name to add"
									onValueChange={value => {
										const result = searchPeople(value, ['first_name', 'last_name']);
										if (result) setUsersSearchResult(result);
									}}
								/>

								<CommandList>
									<CommandGroup noPadding>
										{usersSearchResult.map((user, index) => (
											<CommandItem key={user.id + 'search'} className="flex gap-2" onSelect={() => updateEditors([...editors, user])}>
												<span>
													{(user.profile as any)?.first_name} {(user.profile as any)?.last_name}
												</span>
												•<span className="capitalize">{user.role}</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</div>

						<ul className="space-y-2">
							{editors.map((user, index) => (
								<li className="hov flex items-center justify-between rounded-md py-1 transition-all duration-500 hover:bg-accent/50 hover:px-2" key={user.id}>
									<div className="flex items-center gap-2 text-sm">
										<span>
											{(user.profile as any)?.first_name} {(user.profile as any)?.last_name}
										</span>
										<span>•</span>
										<span className="capitalize text-support">{user.role}</span>
									</div>

									<Button
										variant={'ghost_destructive'}
										type="button"
										className="text-destructive"
										disabled={owner == (user.profile as any)?.id}
										onClick={() => {
											editors.splice(index, 1);
											updateEditors([...editors]);
										}}>
										<Trash2 size={12} />
									</Button>
								</li>
							))}
						</ul>
					</div>
				</div>

				<AlertDialogFooter className="!mt-8">
					<AlertDialogCancel className="w-full" type="button">
						Close
					</AlertDialogCancel>

					<Button className="w-full gap-3" type="submit" disabled={isUpdating}>
						{isUpdating && <LoadingSpinner />} Updat{isUpdating ? 'ing' : 'e'}
					</Button>
				</AlertDialogFooter>
			</form>
		</Form>
	);
};
