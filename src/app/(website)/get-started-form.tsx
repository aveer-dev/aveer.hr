'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlowEffect } from '@/components/ui/glow-effect';
import { Check, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loader';
import { toast } from 'sonner';

export const GetStartedForm = ({ addToWaitlist }: { addToWaitlist: (prevState: any, payload: FormData) => Promise<string | boolean | undefined> }) => {
	const [state, formAction, pending] = useActionState(addToWaitlist, '');

	useEffect(() => {
		if (state && typeof state == 'string') toast.error(state);
	}, [state]);

	return (
		<form action={formAction} className="relative mt-8 flex max-w-md rounded-full border bg-muted p-2 transition-all duration-500 has-[:focus-within]:ring-1 has-[:focus-within]:ring-ring has-[:focus-within]:ring-offset-2">
			<input disabled={state === true} type="email" name="email" aria-label="email" inputMode="email" required className="w-full bg-transparent pl-4 outline-none" placeholder="Email address" />

			<div>
				<Button disabled={pending} className="z-10 cursor-pointer gap-3 rounded-full text-sm">
					Get started
					{pending ? <LoadingSpinner /> : state === true ? <Check size={12} /> : <ChevronRight size={12} />}
				</Button>
			</div>

			<GlowEffect colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']} mode="colorShift" blur="soft" duration={3} scale={1} className="-z-10 h-full w-full rounded-full" />
		</form>
	);
};
