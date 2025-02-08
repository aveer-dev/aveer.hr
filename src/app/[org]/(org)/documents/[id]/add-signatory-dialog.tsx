import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchPeople } from '@/utils/employee-search';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const AddSignatoryDialog = ({ employees, signatory, onAddSignatory }: { employees?: Tables<'contracts'>[] | null; signatory: { id: string; contract?: number }; onAddSignatory: (data: { contract?: number }) => void }) => {
	const [selectedEmployee, setSelectedEmployee] = useState(signatory.contract);
	const [filteredEmployees, setFilteredEmployees] = useState<{ id: number; job_title: string; profile: { first_name: string; last_name: string; id: string } }[]>((employees as any) || []);
	const [open, setOpen] = useState(false);

	const getEmployeeFullname = () => {
		const employee: any = employees?.find(employee => employee.id === selectedEmployee)?.profile;
		const employeeFullName = `${employee?.first_name} ${employee?.last_name}`;

		return employeeFullName;
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				{/* eslint-disable-next-line jsx-a11y/role-has-required-aria-props */}
				<button className="text-sm underline decoration-dashed" role="combobox">
					{selectedEmployee ? 'Change signatory' : 'Add signatory'}
				</button>
			</AlertDialogTrigger>

			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>Add signatory</AlertDialogTitle>
					<AlertDialogDescription>Assign signatory to the selected signature.</AlertDialogDescription>
				</AlertDialogHeader>

				<section className="mt-6 space-y-6">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" role="combobox" className="w-full justify-between">
								{selectedEmployee ? getEmployeeFullname() : 'Select employee...'}
								<ChevronsUpDown size={12} className="opacity-50" />
							</Button>
						</PopoverTrigger>

						<PopoverContent className="w-96 p-0">
							<Command className="w-full" shouldFilter={false}>
								<CommandInput
									placeholder="Search people"
									onValueChange={value => {
										const result = searchPeople(employees as any, value, ['first_name', 'last_name']);
										console.log('🚀 ~ result:', result);
										setFilteredEmployees([...(result as any)]);
									}}
								/>

								<CommandList>
									<CommandEmpty>No person found with that name.</CommandEmpty>
									<CommandGroup>
										{filteredEmployees.map(employee => (
											<CommandItem
												key={employee.id}
												value={String(employee.id)}
												onSelect={currentValue => {
													setSelectedEmployee(Number(currentValue));
													setOpen(false);
												}}>
												{(employee.profile as any).first_name} {(employee.profile as any).last_name}
												<span>•</span>
												{employee.job_title}
												<Check size={12} className={cn('ml-auto', selectedEmployee === employee.id ? 'opacity-100' : 'opacity-0')} />
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</section>

				<AlertDialogFooter className="mt-4 sm:justify-start">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => onAddSignatory({ contract: selectedEmployee })} disabled={!selectedEmployee}>
						Add signatory
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
