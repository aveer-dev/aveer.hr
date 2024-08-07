'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './button';

interface props {
	children: React.ReactNode;
	loading: React.ReactNode;
}

export const SubmitButton = ({ children, loading }: props) => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" size={'sm'} className="px-10 text-sm font-light">
			{pending ? loading : children}
		</Button>
	);
};
