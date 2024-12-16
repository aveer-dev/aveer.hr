'use client';

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Signature } from 'lucide-react';
import './style.scss';
import { toast } from 'sonner';
import { useActionState, useEffect, useState } from 'react';
import { employeeSignContract, signContractAction } from './contract.action';

export const SignatureDrawer = ({ job_title, id, org, first_name, signatureType }: { signatureType?: 'profile' | 'org'; id: number; org: string; job_title: string; first_name: string }) => {
	const [drawerIsOpen, toggleDrawerState] = useState(false);
	const [state, formAction, pending] = useActionState(signatureType ? signContractAction : employeeSignContract, '');

	useEffect(() => {
		if (state) toast.error(state);
	}, [state]);

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
					<form className="mx-auto my-12 w-full max-w-sm" action={formAction}>
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

						<input name="org" hidden defaultValue={org} />
						<input name="id" hidden defaultValue={id} />
						<input name="signature-type" hidden defaultValue={signatureType} />

						<DrawerFooter className="grid grid-cols-2 items-center gap-4">
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DrawerClose>

							<Button type="submit" disabled={pending} size={'sm'} className="px-8 text-xs font-light">
								{pending ? 'Signing contract' : 'Sign contract'}
							</Button>
						</DrawerFooter>
					</form>
				</DrawerContent>
			</Drawer>
		</>
	);
};
