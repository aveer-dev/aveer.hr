'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loader';
import { TablesUpdate } from '@/type/database.types';
import { useCallback, useEffect, useState } from 'react';
import { CircleX, Pencil } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useDebounce } from 'use-debounce';
import { generateRandomString } from '@/utils/generate-string';
import { useRouter } from 'next/navigation';

interface PROPS {
	formAction: (payload: FormData) => Promise<string>;
	data?: TablesUpdate<'organisations'>;
}

export const OrgForm = ({ formAction, data }: PROPS) => {
	const supabase = createClient();
	const [orgData, updateOrgData] = useState({ name: data?.name || '', website: data?.website || 'https://', subdomain: data?.subdomain });
	const [showSubdomainInput, toggleShowDomain] = useState(!!data);
	const [prefixText] = useDebounce(orgData.subdomain, 700);
	const [prefixExists, setPrefixState] = useState(data ? !data : false);
	const [isCheckingPrefix, togglePrefixLoader] = useState(false);
	const router = useRouter();

	const checkDomainPrefix = useCallback(
		async (prefix: string) => {
			if (prefix == data?.subdomain) return;
			if (prefix == 'contractor' || prefix == 'contractors' || prefix == 'app' || prefix == 'apps' || prefix == 'client' || prefix == 'clients') return true;

			togglePrefixLoader(true);
			setPrefixState(false);

			const { data: orgsRes, error } = await supabase.from('organisations').select('subdomain').eq('subdomain', prefix);
			if (!orgsRes || error) return;

			// Filter the orgsRes manually in case-insensitive manner
			const lowerCaseValue = prefix.toLowerCase();
			const filteredData = orgsRes.filter(item => item.subdomain.toLowerCase() === lowerCaseValue);

			if (filteredData && filteredData.length) {
				setPrefixState(true);
				togglePrefixLoader(false);
				return true;
			}

			if (filteredData && !filteredData.length) setPrefixState(false);

			togglePrefixLoader(false);
		},
		[data?.subdomain, supabase]
	);

	useEffect(() => {
		const prefixCheck = async () => {
			if (prefixText) {
				const subdomainExists = await checkDomainPrefix(prefixText);
				if (subdomainExists === true && !showSubdomainInput) {
					const newOrgData = { ...orgData, subdomain: `${orgData.subdomain}-${generateRandomString(4)}` };
					updateOrgData(newOrgData);
				}
			}
		};

		prefixCheck();
	}, [prefixText, checkDomainPrefix, orgData, showSubdomainInput]);

	const SubmitButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button type="submit" disabled={pending || isCheckingPrefix || prefixExists || !prefixText} size={'sm'} className="gap-3 px-4 text-xs font-light">
				{pending && <LoadingSpinner />}
				{pending ? (data ? 'Updating Org' : 'Creating Org') : data ? 'Update Org' : 'Create Org'}
			</Button>
		);
	};

	const submitForm = async (formData: FormData) => {
		const error = await formAction(formData);
		if (error) toast.error(error);
		const isSubdomainChanged = data?.subdomain !== formData.get('subdomain');
		if (isSubdomainChanged) process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN == 'true' ? (location.href = `http://${prefixText}.${process.env.NEXT_PUBLIC_DOMAIN}/settings?type=org`) : router.replace(`../${prefixText}/settings?type=org`);
	};

	return (
		<form className="grid gap-6" action={submitForm}>
			<div className="grid gap-3">
				<Label htmlFor="org-name">Organisation name</Label>
				<Input
					id="org-name"
					value={orgData?.name}
					onChange={event => {
						const newData = { ...orgData, name: event.target.value };
						if (!showSubdomainInput) {
							newData.subdomain = event.target.value
								.replace(/ /g, '-')
								.replace(/[^a-zA-Z0-9-]/g, '')
								.toLowerCase();
						}
						updateOrgData({ ...orgData, ...newData });
					}}
					type="text"
					autoComplete="off"
					name="org-name"
					placeholder="Organisation name or full name"
					required
				/>
				{!showSubdomainInput && (
					<div className="-mt-2 flex gap-2 text-xs font-thin text-muted-foreground">
						org url: https://{orgData.subdomain || 'org-name'}.aveer.hr{' '}
						<button className="rounded-md bg-secondary p-1" onClick={() => toggleShowDomain(!showSubdomainInput)}>
							<Pencil size={10} />
						</button>
						{isCheckingPrefix && (
							<div className="scale-75">
								<LoadingSpinner />
							</div>
						)}
					</div>
				)}
			</div>

			{showSubdomainInput && (
				<div className="grid gap-3">
					<Label htmlFor="subdomain">Organisation url</Label>
					<div className="relative text-xs text-muted-foreground">
						<div className="absolute left-2 top-1/2 -translate-y-1/2">https://</div>
						<Input
							id="subdomain"
							className="pl-14 pr-16"
							value={orgData.subdomain}
							onChange={event => {
								updateOrgData({
									...orgData,
									subdomain: event.target.value
										.replace(/ /g, '-')
										.replace(/[^a-zA-Z0-9-]/g, '')
										.toLowerCase()
								});
							}}
							type="text"
							name="subdomain"
							placeholder="Organisation's custom subdomain"
							required
						/>
						<div className="absolute right-2 top-1/2 -translate-y-1/2">.aveer.hr</div>
						{isCheckingPrefix && (
							<div className="absolute -right-6 top-1/2 -translate-y-1/2">
								<LoadingSpinner />
							</div>
						)}
						{!isCheckingPrefix && prefixExists && (
							<div className="absolute -right-6 top-1/2 -translate-y-1/2">
								<CircleX size={14} className="text-destructive" />
							</div>
						)}
					</div>
				</div>
			)}

			<div className="grid gap-3">
				<Label htmlFor="website">Website</Label>
				<Input id="website" value={orgData.website} onChange={event => updateOrgData({ ...orgData, website: event.target.value })} type="url" name="website" placeholder="https://aveer.hr" />
			</div>

			<div className="flex w-full items-center justify-end gap-4">
				<SubmitButton />
			</div>
		</form>
	);
};
