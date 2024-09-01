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
	setLevelDetails: (data: { level: TablesInsert<'employee_levels'>; isOrgs: boolean } | undefined) => void;
	orgJobLevels: TablesInsert<'employee_levels'>[];
	updateOrgJobLevels: Dispatch<SetStateAction<TablesInsert<'employee_levels'>[]>>;
	isDialogOpen: boolean;
	openDialog: (state: boolean) => void;
}

export const CompensationDialog = ({ isDialogOpen, openDialog, form, selectedLevelId, setLevelDetails, orgJobLevels, updateOrgJobLevels }: props) => {
	const [selectedLevel, setActiveLevel] = useState<{ level?: TablesInsert<'employee_levels'>; isOrgs: boolean }>();
	const [showFixedIncome, toggleShowFixedIncome] = useState(false);
	const [showSigningBonus, toggleShowSigningBonus] = useState(false);
	const [showSalaryCustomError, toggleSalaryCustomError] = useState(false);
	const [showSigningCustomError, toggleSigningCustomError] = useState(false);

	const validateSalary = (salary: number) => {
		const level = selectedLevel?.level;

		if (!level?.min_salary || !level?.max_salary) return;
		if (salary < level?.min_salary || salary > level?.max_salary) toggleSalaryCustomError(true);
		else toggleSalaryCustomError(false);
	};

	const validateBonus = (bonus: number) => {
		const level = selectedLevel?.level;

		if (!level?.min_signing_bonus || !level?.min_signing_bonus) return;
		if (bonus < level?.min_signing_bonus || bonus > level?.min_signing_bonus) toggleSigningCustomError(true);
		else toggleSigningCustomError(false);
	};

	const onSetActiveLevel = (event: { level: TablesInsert<'employee_levels'>; isOrgs: boolean } | undefined) => {
		setLevelDetails(event);
		setActiveLevel(event);

		toggleShowFixedIncome(!!event?.level?.fixed_allowance?.length);
		toggleShowSigningBonus(!!event?.level?.min_signing_bonus);
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
							<SelectLevel updateOrgJobLevels={updateOrgJobLevels} orgJobLevels={orgJobLevels} setLevelDetails={onSetActiveLevel} selectedLevelId={selectedLevelId} form={form} />

							<div className="mb-10 grid gap-8">
								<PayInput form={form} name="salary" label="Base salary" minValue={Number(selectedLevel?.level?.min_salary)} maxValue={Number(selectedLevel?.level?.max_salary)} validateSalary={validateSalary} salaryInvalid={showSalaryCustomError} />

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
												<PayInput
													form={form}
													name="signing_bonus"
													minValue={Number(selectedLevel?.level?.min_signing_bonus)}
													maxValue={Number(selectedLevel?.level?.max_signing_bonus)}
													validateSalary={validateBonus}
													salaryInvalid={showSigningCustomError}
												/>
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
												setLevelDetails({ isOrgs: selectedLevel?.isOrgs, level: selectedLevel?.level });
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
