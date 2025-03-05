import { TextLoop } from '@/components/ui/text-loop';
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
		<section className="hero relative mx-auto grid h-full max-w-6xl items-center px-5 py-32 md:py-28 lg:grid-cols-2 lg:py-60">
			<div className="">
				<h1 className="text-6xl font-extrabold leading-snug lg:max-w-md">
					Employee management for
					<TextLoop
						className="overflow-y-clip"
						auto
						interval={3}
						transition={{
							type: 'spring',
							stiffness: 900,
							damping: 80,
							mass: 10
						}}
						variants={{
							initial: {
								y: 20,
								rotateX: 90,
								opacity: 0,
								filter: 'blur(4px)'
							},
							animate: {
								y: 0,
								rotateX: 0,
								opacity: 1,
								filter: 'blur(0px)'
							},
							exit: {
								y: -20,
								rotateX: -90,
								opacity: 0,
								filter: 'blur(4px)'
							}
						}}>
						<span className="pl-4">founders</span>
						<span className="pl-4">SMEs</span>
						<span className="pl-4">Startups</span>
						<span className="pl-4">Teams</span>
					</TextLoop>
					.
				</h1>
				<p className="mt-4 max-w-md text-lg font-light leading-7">Focus on building, let aveer.hr focus of managing your employees. We don&apos;t force structures on you.</p>

				<GetStartedForm addToWaitlist={addToWaitList} />
			</div>

			<div className="relative hidden h-full lg:block">
				<div className="absolute -bottom-20 -left-5 -right-20 -top-20 -z-10 w-full scale-[2] rounded-full bg-primary opacity-5 blur-2xl"></div>

				<div className="absolute left-0 top-1/2 z-10 w-[975px] -translate-y-1/2">
					<Image src={'/aveer.hrproduct-browser.png'} className="h-full w-full" width={2288} height={1523.53} alt="aveer.hrproduct in browser" priority />
				</div>
			</div>
		</section>
	);
}
