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
import { useCallback, useEffect, useState } from 'react';
import { Tables } from '@/type/database.types';
import { updateDocument } from './document.actions';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { DocumentAccessor } from './accessor-item';
import { searchPeople } from '@/utils/employee-search';
import { Input } from '@/components/ui/input';
import { SHARED_WITH, DOCUMENT_ACCESS_TYPE } from './types';

const FormSchema = z.object({
	private: z.boolean().default(true).optional(),
	shared_with: z.object({ contract: z.number().optional(), profile: z.string(), access: z.enum(['editor', 'viewer', 'owner']) }).array()
});

interface props {
	employees?: Tables<'contracts'>[] | null;
	doc: Tables<'documents'>;
	currentUserId: string;
	onStateChange?: (updates: Partial<Tables<'documents'>>) => void;
}

export const DocumentSettings = ({ doc, currentUserId, employees, onStateChange }: props) => {
	const [employeeSearchResult, setEmployeeSearchResult] = useState<Tables<'contracts'>[]>([]);
	const [isUpdating, setUpdateState] = useState(false);
	const [sharedWith, updateSharedWith] = useState<SHARED_WITH[]>((doc.shared_with as any) || []);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			private: doc.private,
			shared_with: sharedWith
		}
	});

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		setUpdateState(true);
		const { error } = await updateDocument({ private: data.private, shared_with: sharedWith as any, id: doc.id, org: (doc.org as any)?.subdomain || doc.org });
		setUpdateState(false);
		if (error) return toast.error(error.message);
		onStateChange?.({ private: data.private, shared_with: sharedWith as any });
		toast.success('Document settings updated successfully');
		const currentUserRemoved = !sharedWith.find(person => person.profile == currentUserId);
		if (currentUserRemoved) router.push('./');
		router.refresh();
	};

	const onTogglePrivate = (value: boolean) => {
		form.setValue('private', value);
		onSubmit(form.getValues());
	};

	useEffect(() => {
		form.setValue('shared_with', sharedWith);
		setEmployeeSearchResult(employees => employees?.filter(employee => !sharedWith?.find(person => (employee?.profile as any).id == person.profile)) || []);
	}, [form, sharedWith]);

	const onRemovePerson = (index: number) => {
		sharedWith.splice(index, 1);
		updateSharedWith([...sharedWith]);
	};

	const onUpdatePersonAccess = (index: number, access: DOCUMENT_ACCESS_TYPE) => {
		sharedWith[index].access = access;
		updateSharedWith([...sharedWith]);
	};

	const onSelectAllEmployees = useCallback(() => {
		updateSharedWith(employees?.map(employee => ({ profile: (employee.profile as any).id as string, contract: employee.id, access: 'viewer' })) || []);
	}, [employees]);

	const copyLink = (link: string) => {
		navigator.clipboard.writeText(link).then(() => toast('Document copied to clipboard'));
	};

	const onSelectEmployee = useCallback((employee: { profile: any; id: any }) => updateSharedWith([...sharedWith, { profile: employee.profile.id, contract: employee.id, access: 'viewer' }]), [sharedWith]);

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
										<FormLabel className="text-sm font-normal text-primary">Restricted</FormLabel>
										<FormDescription>{field.value ? 'Only people with access can open' : 'Anyone on the internet with the link can access'}</FormDescription>
									</div>

									<FormControl>
										<Switch className="scale-75" checked={field.value} onCheckedChange={onTogglePrivate} />
									</FormControl>
								</FormItem>
							)}
						/>

						{!doc.private && (
							<div className="flex items-center">
								<Input className="h-9 rounded-e-none focus-visible:ring-0 focus-visible:ring-transparent" readOnly defaultValue={`https://${(doc.org as any)?.subdomain}.aveer.hr/shared-doc/${doc.link_id}`} />
								<Button className="rounded-s-none" type="button" onClick={copyLink.bind(this, `https://${(doc.org as any)?.subdomain}.aveer.hr/shared-doc/${doc.link_id}`)}>
									Copy link
								</Button>
							</div>
						)}

						<div className="space-y-3">
							<Label>Add employees</Label>
							<Command className="rounded-lg border md:min-w-[450px]" shouldFilter={false}>
								<CommandInput
									placeholder="Type an admin name to add"
									value={searchQuery}
									onValueChange={value => {
										setSearchQuery(value);
										const result = searchPeople(employees as any[], value, ['first_name', 'last_name'], true);
										if (result) setEmployeeSearchResult(result as any[]);
									}}
								/>

								<CommandList>
									<CommandGroup noPadding>
										{sharedWith.length !== employees?.length && (
											<CommandItem className="flex gap-2" onSelect={onSelectAllEmployees}>
												All employees
											</CommandItem>
										)}

										{employeeSearchResult.map(employee => {
											const isShared = sharedWith.find(person => person.profile == ((employee.profile as any)?.id || employee.profile));
											if (isShared) return null;

											return (
												<CommandItem
													key={employee.id + 'search'}
													className="flex gap-2"
													onSelect={() => {
														onSelectEmployee(employee);
														setSearchQuery('');
													}}>
													<span>
														{(employee.profile as any)?.first_name} {(employee.profile as any)?.last_name}
													</span>
													•<span className="capitalize">{employee.role}</span>
												</CommandItem>
											);
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</div>

						<Label>People with access</Label>
						<ul className="!mt-2.5 max-h-40 space-y-2 overflow-y-auto">
							{sharedWith
								.sort(a => (a.profile == doc.owner ? -1 : 1))
								.map((user, index) => (
									<DocumentAccessor
										ownerProfileId={doc.owner}
										onRemove={() => onRemovePerson(index)}
										onUpdateAccess={onUpdatePersonAccess.bind(this, index)}
										user={user}
										accessor={employees?.find(employee => (employee.profile as any).id == user.profile) as Tables<'contracts'>}
										key={index}
									/>
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
