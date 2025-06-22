import Image from 'next/image';
import { GetStartedForm } from './get-started-form';
import { createClient } from '@/utils/supabase/server';

export default async function LandingPage() {
	const addToWaitList = async (_prevState: any, payload: FormData) => {
		'use server';

		const email = payload.get('email') as string;
		if (!email) return;

		const supabase = await createClient();

		const { error } = await supabase.from('waitlist').insert({ source: 'website', email });

		if (error) return error.message;
		return true;
	};

	return (
		<section className="hero relative mx-auto h-full max-w-3xl items-center px-5 py-32 sm:py-8 lg:max-w-7xl">
			<div className="relative hidden h-full sm:block">
				<div className="relative rounded-xl py-4">
					<div className="absolute -left-24 -right-5 -top-20 bottom-56 -z-10 rounded-full bg-primary opacity-5 blur-2xl"></div>
					<Image src={'/aveer.hrproduct-browser.png'} className="h-full w-full" width={2288} height={1523.53} alt="aveer.hrproduct in browser" priority />
					<div className="absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-background from-40% to-transparent"></div>
				</div>
			</div>

			<div className="relative flex flex-col gap-8 sm:-mt-28 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="w-full max-w-md text-3xl font-extrabold leading-snug lg:max-w-md">A better way to manage your employees</h1>

				<GetStartedForm addToWaitlist={addToWaitList} />
			</div>
		</section>
	);
}
