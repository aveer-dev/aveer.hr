'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormDescription } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { AdditionalOffering } from '../additional-offering';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface props {
	form: UseFormReturn<any>;
	isDialogOpen: boolean;
	openDialog: (state: boolean) => void;
	orgBenefits: string[];
}

export const AdditionalOfferingDialog = ({ isDialogOpen, openDialog, form, orgBenefits }: props) => {
	const [showOrgBenefits, toggleOrgBenefits] = useState(true);
	const [showBenefits, toggleBenefits] = useState(form.getValues('additional_offerings').length);
	const [benefitsFromOrg, setBenefitsFromOrg] = useState<string[]>([]);

	useEffect(() => {
		const filteredBenefits = form.getValues('additional_offerings').filter((benefit: string) => orgBenefits?.find(ben => ben == benefit));
		setBenefitsFromOrg(filteredBenefits);
	}, [form, orgBenefits]);

	return (
		<Sheet open={isDialogOpen} onOpenChange={openDialog}>
			<SheetContent className="w-full overflow-auto pb-24 sm:max-w-md">
				<SheetHeader className="mb-6">
					<SheetTitle>Update Additional Offering</SheetTitle>
					<SheetDescription className="text-xs">Edit additional offering specifically for this person</SheetDescription>
				</SheetHeader>

				<div className="grid gap-4 py-6">
					<Form {...form}>
						<form className="space-y-8">
							<div>
								<AdditionalOffering readonly benefits={benefitsFromOrg} label={`Organisation's additional benefits`} toggle={toggleOrgBenefits} isToggled={showOrgBenefits} form={form} />
								<FormDescription className="mt-1">
									Review and edit organisation additional benefits
									<Link href={'../settings?type=org#employee-policies'} className="ml-1 inline-flex w-fit items-center gap-1 rounded-md bg-accent px-1">
										here <ArrowUpRight size={12} />
									</Link>
								</FormDescription>
							</div>

							<AdditionalOffering label={`Additional benefits unique for this person`} toggle={toggleBenefits} isToggled={showBenefits} form={form} />

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
