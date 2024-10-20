'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Signature } from 'lucide-react';
import './style.scss';
import { toast } from 'sonner';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { employeeSignContract } from './contract.action';

export const SignatureDrawer = ({ job_title, id, org, first_name, signatureAction }: { id?: number; org?: string; job_title: string; first_name: string; signatureAction?: (payload: FormData) => Promise<string> }) => {
	const [drawerIsOpen, toggleDrawerState] = useState(false);

	const signContract = async (formData: FormData) => {
		const response = signatureAction ? await signatureAction(formData) : id && org && (await employeeSignContract({ payload: formData, id, org }));
		if (response) return toast.error(response || 'Unable to sign contract');
		toggleDrawerState(false);
	};

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending} size={'sm'} className="px-8 text-xs font-light">
				{pending ? 'Signing contract' : 'Sign contract'}
			</Button>
		);
	};

	return (
		<>
			<Drawer open={drawerIsOpen} onOpenChange={toggleDrawerState}>
				<DrawerTrigger asChild>
					<Button size={'sm'} className="w-full gap-4 sm:w-fit">
						Sign Contract
						<Signature size={12} />
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<form className="mx-auto my-12 w-full max-w-sm" action={signContract}>
						<DrawerHeader className="gap-3">
							<DrawerTitle>Sign Contract</DrawerTitle>
							<DrawerDescription className="text-xs font-light leading-6">
								Enter your legal full name to sign the <strong className="text-foreground">{job_title}</strong> contract, hiring <strong className="text-foreground">{first_name}</strong>
							</DrawerDescription>
						</DrawerHeader>

						<input
							type="text"
							placeholder="Enter your legal full name"
							name="signature-string"
							autoComplete="off"
							required
							id="signature-string"
							aria-label="Signature text"
							className="signature m-4 mt-7 w-[calc(100%-32px)] border-b border-b-foreground text-2xl outline-none placeholder:font-karla"
						/>

						<DrawerFooter className="grid grid-cols-2 items-center gap-4">
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DrawerClose>
							<SubmitButton />
						</DrawerFooter>
					</form>
				</DrawerContent>
			</Drawer>
		</>
	);
};
