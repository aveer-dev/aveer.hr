'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TablesInsert } from '@/type/database.types';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Dispatch, SetStateAction, useState } from 'react';
import { FixedAllowance } from '@/components/forms/fixed-allowance';
import { SelectLevel } from '../level-option';
import { PayInput } from '../pay-input';
import { Switch } from '@/components/ui/switch';

interface props {
	form: UseFormReturn<any>;
	selectedLevelId: string;
	setLevelDetails: (level: TablesInsert<'employee_levels'> | undefined) => void;
	orgJobLevels: TablesInsert<'employee_levels'>[];
	updateOrgJobLevels: Dispatch<SetStateAction<TablesInsert<'employee_levels'>[]>>;
	isDialogOpen: boolean;
	openDialog: (state: boolean) => void;
}

export const CompensationDialog = ({ isDialogOpen, openDialog, form, selectedLevelId, setLevelDetails, orgJobLevels, updateOrgJobLevels }: props) => {
	const [selectedLevel, setActiveLevel] = useState<TablesInsert<'employee_levels'>>();
	const [showFixedIncome, toggleShowFixedIncome] = useState(false);
	const [showSigningBonus, toggleShowSigningBonus] = useState(false);
	const [showSalaryCustomError, toggleSalaryCustomError] = useState(false);
	const [showSigningCustomError, toggleSigningCustomError] = useState(false);

	const validateSalary = (salary: number) => {
		if (!selectedLevel?.min_salary || !selectedLevel?.max_salary) return;
		if (salary < selectedLevel?.min_salary || salary > selectedLevel?.max_salary) toggleSalaryCustomError(true);
		else toggleSalaryCustomError(false);
	};

	const validateBonus = (bonus: number) => {
		if (!selectedLevel?.min_signing_bonus || !selectedLevel?.min_signing_bonus) return;
		if (bonus < selectedLevel?.min_signing_bonus || bonus > selectedLevel?.min_signing_bonus) toggleSigningCustomError(true);
		else toggleSigningCustomError(false);
	};

	const onSetActiveLevel = (event: TablesInsert<'employee_levels'> | undefined) => {
		setLevelDetails(event);
		setActiveLevel(event);

		toggleShowFixedIncome(!!event?.fixed_allowance?.length);
		toggleShowSigningBonus(!!event?.min_signing_bonus);
	};

	return (
		<Sheet open={isDialogOpen} onOpenChange={openDialog}>
			<SheetContent className="w-full overflow-auto pb-24 sm:max-w-md">
				<SheetHeader className="mb-6">
					<SheetTitle>Update Compensation</SheetTitle>
					<SheetDescription className="text-xs">Edit level, base salary, signing bonus and fixed allowance details.</SheetDescription>
				</SheetHeader>

				<div className="grid gap-4 py-6">
					<Form {...form}>
						<form className="space-y-8">
							<SelectLevel orgJobLevels={orgJobLevels} setLevelDetails={onSetActiveLevel} selectedLevelId={selectedLevelId} form={form} />

							<div className="mb-10 grid gap-8">
								<PayInput form={form} name="salary" label="Gross annual salary" minValue={Number(selectedLevel?.min_salary)} maxValue={Number(selectedLevel?.max_salary)} validateSalary={validateSalary} salaryInvalid={showSalaryCustomError} />

								<FormField
									control={form.control}
									name="signing_bonus"
									render={() => (
										<FormItem className="grid w-full gap-3 rounded-lg bg-accent p-2">
											<div className="flex items-center justify-between space-x-2">
												<FormLabel htmlFor="signing-bonus">Signing bonus</FormLabel>
												<Switch checked={showSigningBonus} onCheckedChange={event => toggleShowSigningBonus(event)} id="signing-bonus" className="scale-75" />
											</div>

											{showSigningBonus && (
												<PayInput form={form} name="signing_bonus" minValue={Number(selectedLevel?.min_signing_bonus)} maxValue={Number(selectedLevel?.max_signing_bonus)} validateSalary={validateBonus} salaryInvalid={showSigningCustomError} />
											)}
										</FormItem>
									)}
								/>

								<FixedAllowance
									toggle={event => {
										toggleShowFixedIncome(event);

										if (event == false) {
											form.setValue('fixed_allowance', []);
											if (selectedLevel?.level) {
												setActiveLevel({ ...selectedLevel });
												setLevelDetails(selectedLevel);
											}
										}
									}}
									isToggled={showFixedIncome}
									form={form}
								/>
							</div>

							<Button onClick={() => openDialog(false)} type="button" size={'sm'} className="mt-8 w-full gap-2">
								Update
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
};
