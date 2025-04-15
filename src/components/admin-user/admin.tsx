'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Tables, TablesInsert } from '@/type/database.types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addAdminPerson } from './admin-actions';

const formSchema = z.object({
	role: z.enum(['admin', 'roles_manager']),
	profile: z.string().min(2, { message: 'Select an employee' })
});

export const AddAdmin = ({ org, employees }: { org: string; employees?: Tables<'contracts'>[] | null }) => {
	const [isAddingAdmin, setAddAdminState] = useState(false);
	const [isOpen, toggleOpenState] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { role: 'admin', profile: '' }
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setAddAdminState(true);

		const payload: TablesInsert<'profiles_roles'> = { ...values, organisation: org };
		const response = await addAdminPerson(payload);
		setAddAdminState(false);
		if (typeof response == 'string') return toast.error('Error adding admin', { description: response });

		toast.success('Admin user added');
		form.reset();
		router.refresh();
		toggleOpenState(false);
	};

	return (
		<>
			<AlertDialog open={isOpen} onOpenChange={toggleOpenState}>
				<AlertDialogTrigger asChild>
					<Button variant="outline" className="gap-2">
						<Plus size={12} />
						Add admin
					</Button>
				</AlertDialogTrigger>

				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>Add new admin user</AlertDialogTitle>
						<AlertDialogDescription>Select admin user from a list of employees in your organisation</AlertDialogDescription>
					</AlertDialogHeader>

					<section className="grid gap-4 py-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<FormField
									control={form.control}
									name="profile"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Employee</FormLabel>

											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select employee" />
													</SelectTrigger>
												</FormControl>

												<SelectContent>
													{employees?.map(employee => (
														<SelectItem key={employee.id} value={(employee.profile as any).id}>
															{(employee.profile as any).first_name} {(employee.profile as any).last_name} - {employee.job_title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select role" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="admin">Admin</SelectItem>
													<SelectItem value="roles_manager">Roles Manager</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>

									<Button type="submit" disabled={isAddingAdmin} size={'sm'} className="gap-3 px-4 text-xs font-light">
										{isAddingAdmin && <LoadingSpinner />}
										{isAddingAdmin ? 'Adding admin' : 'Add admin'}
									</Button>
								</AlertDialogFooter>
							</form>
						</Form>
					</section>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
