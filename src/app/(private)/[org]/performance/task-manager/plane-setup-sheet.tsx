'use client';

import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { Clipboard } from 'lucide-react';
import { useState, useTransition } from 'react';
import { LoadingSpinner } from '@/components/ui/loader';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
	plane_workspace_slug: z.string().min(2, { message: 'Enter workspace slug' }),
	plane_key: z.string().min(2, { message: 'Enter API key' }),
	plane_project: z.string().min(2, { message: 'Enter project ID' }),
	plane_link: z.string().min(2, { message: 'Enter Plane project link' })
});

export const PlaneSetupSheet = ({ updateOrg }: { updateOrg: (payload: { plane_workspace_slug: string; plane_key: string; plane_project: string }) => Promise<string | boolean> }) => {
	const [isOpen, toggle] = useState(false);
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			plane_key: '',
			plane_project: '',
			plane_workspace_slug: '',
			plane_link: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		startTransition(async function () {
			const res = await updateOrg({
				plane_workspace_slug: values.plane_workspace_slug,
				plane_key: values.plane_key,
				plane_project: values.plane_project
			});

			startTransition(() => {
				if (typeof res == 'string') toast.error(res);
				else {
					toggle(false);
					router.refresh();
				}
			});
		});
	};

	const isValidUrl = (urlString: string) => {
		try {
			return Boolean(new URL(urlString));
		} catch (e) {
			return false;
		}
	};

	const setProjectLink = async () => {
		try {
			const text = await navigator.clipboard.readText();
			const isLink = isValidUrl(text);
			if (!isLink) return;

			form.setValue('plane_link', text);
			const urlSplit = text.split('https://app.plane.so/')[1].split('/');
			form.setValue('plane_workspace_slug', urlSplit[0]);
			form.setValue('plane_project', urlSplit[2]);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={toggle}>
			<SheetTrigger asChild>
				<Button className="mt-4 pl-7">
					Connect
					<svg width="90" height="28" viewBox="0 0 90 28" fill="none" className="scale-50" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M29.8811 22.0425V4.4831H37.6604C39.5052 4.4831 40.9584 4.99592 42.02 6.02152C43.0815 7.02946 43.6124 8.39991 43.6124 10.1329C43.6124 11.8658 43.0815 13.2451 42.02 14.2707C40.9584 15.2787 39.5052 15.7827 37.6604 15.7827H31.8388V22.0425H29.8811ZM31.8388 13.9259H37.5299C38.8873 13.9259 39.9142 13.59 40.6102 12.918C41.3064 12.246 41.6544 11.3177 41.6544 10.1329C41.6544 8.96578 41.3064 8.04625 40.6102 7.37431C39.9142 6.70234 38.8873 6.36637 37.5299 6.36637H31.8388V13.9259ZM44.6807 22.0425V3.47516H46.6387V22.0425H44.6807ZM54.3678 22.2547C53.0973 22.2547 51.9836 21.9541 51.0264 21.3529C50.0865 20.734 49.3557 19.9028 48.8336 18.8596C48.3115 17.8162 48.0506 16.6668 48.0506 15.4113C48.0506 14.1381 48.3115 12.9887 48.8336 11.9631C49.3557 10.9198 50.0865 10.0975 51.0264 9.49629C51.9836 8.87737 53.0973 8.56791 54.3678 8.56791C55.447 8.56791 56.3692 8.78012 57.135 9.20449C57.9183 9.6289 58.5533 10.2036 59.0408 10.9286V8.78012H60.9985V22.0425H59.0408V19.9205C58.5533 20.6279 57.9183 21.1937 57.135 21.6181C56.3692 22.0425 55.447 22.2547 54.3678 22.2547ZM54.629 20.451C55.6035 20.451 56.4214 20.2212 57.0828 19.7614C57.7615 19.3016 58.2751 18.6916 58.6231 17.9312C58.971 17.1531 59.1452 16.3132 59.1452 15.4113C59.1452 14.4918 58.971 13.6518 58.6231 12.8915C58.2751 12.1311 57.7615 11.521 57.0828 11.0613C56.4214 10.6015 55.6035 10.3716 54.629 10.3716C53.6716 10.3716 52.8452 10.6015 52.1489 11.0613C51.4527 11.521 50.922 12.1311 50.5565 12.8915C50.1909 13.6518 50.0083 14.4918 50.0083 15.4113C50.0083 16.3132 50.1909 17.1531 50.5565 17.9312C50.922 18.6916 51.4527 19.3016 52.1489 19.7614C52.8452 20.2212 53.6716 20.451 54.629 20.451ZM63.2104 22.0425V8.78012H65.1681V10.849C65.6381 10.2125 66.2124 9.67311 66.8913 9.23104C67.57 8.78896 68.4401 8.56791 69.5016 8.56791C70.4066 8.56791 71.2509 8.78896 72.0339 9.23104C72.8346 9.65544 73.4783 10.3009 73.9656 11.1674C74.4704 12.0161 74.7228 13.0683 74.7228 14.3238V22.0425H72.7648V14.3768C72.7648 13.1744 72.4256 12.2107 71.7466 11.4856C71.068 10.7429 70.1891 10.3716 69.1103 10.3716C68.3791 10.3716 67.7178 10.5396 67.1262 10.8756C66.5346 11.2116 66.0558 11.689 65.6903 12.3079C65.3423 12.9091 65.1681 13.6076 65.1681 14.4034V22.0425H63.2104ZM82.617 22.2547C81.2946 22.2547 80.1372 21.9541 79.1451 21.3529C78.1531 20.734 77.3788 19.9028 76.8218 18.8596C76.2824 17.8162 76.0124 16.6668 76.0124 15.4113C76.0124 14.1381 76.2736 12.9887 76.7957 11.9631C77.3178 10.9198 78.066 10.0975 79.0407 9.49629C80.0152 8.87737 81.1638 8.56791 82.4865 8.56791C83.8266 8.56791 84.9752 8.87737 85.9323 9.49629C86.9071 10.0975 87.6555 10.9198 88.1776 11.9631C88.6998 12.9887 88.9607 14.1381 88.9607 15.4113V16.2071H78.0226C78.127 16.9851 78.3706 17.7013 78.7534 18.3556C79.1539 18.9922 79.6845 19.505 80.3459 19.894C81.0073 20.2654 81.773 20.451 82.6431 20.451C83.5657 20.451 84.3402 20.2477 84.9667 19.841C85.5932 19.4166 86.0804 18.8772 86.4284 18.2229H88.569C88.1167 19.4077 87.3943 20.3803 86.4023 21.1407C85.4278 21.8834 84.1661 22.2547 82.617 22.2547ZM78.0487 14.3503H86.9244C86.7505 13.2186 86.2806 12.2726 85.5149 11.5122C84.7491 10.7518 83.7395 10.3716 82.4865 10.3716C81.2336 10.3716 80.2242 10.7518 79.4585 11.5122C78.7101 12.2726 78.2401 13.2186 78.0487 14.3503Z"
							fill="white"
						/>
						<path d="M19.223 1.92969H6.40771V8.68145H12.8154V15.1921H19.223V1.92969Z" fill="white" />
						<path d="M6.40762 8.68134H0V15.192H6.40762V8.68134Z" fill="white" />
						<path d="M12.8153 15.192H6.40771V21.7026H12.8153V15.192Z" fill="white" />
					</svg>
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Configure Plane</SheetTitle>
					<SheetDescription>Follow intructions below to connect your org&apos;s plane account to aveer</SheetDescription>
				</SheetHeader>

				<div className="grid gap-4 py-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="plane_link"
								render={({ field }) => (
									<FormItem>
										<ol className="ml-5 mt-6 list-decimal space-y-2 text-xs">
											<li>Log into your Plane account</li>
											<li>On the side bar, click on the three dot menu of project of choice</li>
											<li>From the presented menu, click on copy link and past in input box below</li>
										</ol>
										<Image width={500} className="!my-4" height={500} src={'https://api.aveer.hr/storage/v1/object/public/platform%20assets/plane-project-link-instruction.png'} alt={'plane-project-link-instruction'} />
										<FormLabel>Plane project link</FormLabel>

										<div className="relative">
											<FormControl>
												<Input placeholder="Project link" {...field} onBlur={setProjectLink} className="pr-12" />
											</FormControl>

											<Button variant={'outline'} className="absolute right-0.5 top-1/2 -translate-y-1/2 text-xs" type="button" onClick={setProjectLink}>
												<Clipboard size={12} />
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="plane_key"
								render={({ field }) => (
									<FormItem>
										<ol className="ml-5 mt-16 list-decimal space-y-2 text-xs">
											<li>
												<p>Go to Workspace Settings</p>
												<Image width={500} className="!my-4 -ml-4" height={500} src={'https://api.aveer.hr/storage/v1/object/public/platform%20assets/workspace-instruction.png?t=2024-12-19T08%3A27%3A09.124Z'} alt={'go to work space instruction'} />
											</li>
											<li>
												<p>Go to API tokens in the list of tabs available</p>
												<Image width={500} className="!my-4 -ml-4" height={500} src={'https://api.aveer.hr/storage/v1/object/public/platform%20assets/api-token-instruction.png'} alt={'go to api token instruction'} />
											</li>
											<li>
												<p>Click Add API token</p>
												<Image width={500} className="!my-4 -ml-4" height={500} src={'https://api.aveer.hr/storage/v1/object/public/platform%20assets/create-api-token-instruction.png'} alt={'copy api tokeninstruction'} />
											</li>
										</ol>

										<FormLabel>Plane API Key</FormLabel>
										<div className="relative">
											<FormControl>
												<Input
													placeholder="API key"
													{...field}
													onBlur={async () => {
														const text = await navigator.clipboard.readText();
														if (!text) return;
														field.onChange(text);
													}}
												/>
											</FormControl>
											<Button
												variant={'outline'}
												className="absolute right-0.5 top-1/2 -translate-y-1/2 text-xs"
												type="button"
												onClick={async () => {
													const text = await navigator.clipboard.readText();
													if (!text) return;
													field.onChange(text);
												}}>
												<Clipboard size={12} />
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button className="w-full gap-3" disabled={pending} type="submit">
								{pending && <LoadingSpinner />}
								Complete setup
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
};
