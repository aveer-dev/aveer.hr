'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

interface PROPS {
	formAction: (payload: FormData) => Promise<string>;
}

export const CreateOrgForm = ({ formAction }: PROPS) => {
	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" size={'sm'} className="px-6 text-xs font-light">
				{pending ? 'Creating org...' : 'Create'}
			</Button>
		);
	};

	const submitForm = async (formData: FormData) => {
		const error = await formAction(formData);
		if (error) return toast.error(error);
	};

	return (
		<form className="grid gap-6" action={submitForm}>
			<div className="grid gap-3">
				<Label htmlFor="org-name">Organisation name</Label>
				<Input id="org-name" type="text" name="org-name" placeholder="Organisation name or full name" required />
			</div>

			<div className="grid gap-3">
				<Label htmlFor="website">Website</Label>
				<Input id="website" type="url" name="website" placeholder="https://aveer.hr" />
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<SubmitButton />
			</div>
		</form>
	);
};