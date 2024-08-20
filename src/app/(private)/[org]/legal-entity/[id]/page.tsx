import { BackButton } from '@/components/ui/back-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { FilePenLine } from 'lucide-react';
import Link from 'next/link';

export default async function ViewEntityPage(props: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();
	const { error, data } = await supabase.from('legal_entities').select('*, address_state:states!legal_entities_address_state_fkey(id, name), org:organisations!legal_entities_org_fkey(id, name, website)').match({ id: props.params.id, org: props.params.org }).single();

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<p className="text-xs">Unable to fetch legal entity, please refresh page to try again</p>
				<p className="mt-6 text-xs text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	const companyRequiredIds: { [key: string]: { tax_no: string; rn?: string } } = {
		US: { tax_no: 'Employer Indentification Number (EIN)' },
		CA: { tax_no: 'Business Number (BN)' },
		GB: {
			tax_no: 'Unique Tax Reference (UTR)',
			rn: 'Company Registration Number (CRN)'
		},
		NG: {
			tax_no: 'Tax Indentification Number (TIN)',
			rn: 'Registration Number (RC) '
		}
	};

	return (
		<section className="mx-auto -mt-6 grid max-w-4xl gap-10 p-6 pt-0">
			<div className="flex justify-between">
				<div className="relative flex">
					<BackButton className="absolute -left-16" />

					<div className="">
						<h1 className="flex items-center gap-4 text-2xl font-bold">{data?.name}</h1> <p className="flex gap-2 text-xs font-light">{data?.incorporation_country}</p>
					</div>
				</div>

				<Link href={`./${props.params.id}/edit`} className={cn(buttonVariants({ size: 'sm' }), 'gap-4')}>
					Update Entity
					<FilePenLine size={12} />
				</Link>
			</div>

			<div className="mt-5 grid gap-20">
				<div>
					<h1 className="mb-4 text-xl font-semibold">Entity Owner</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-2">
							<p className="text-sm font-medium">Organisation Name</p>
							<p className="text-sm font-light">{data?.org?.name}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Organisation website</p>
							<p className="text-sm font-light">{data?.org?.website || '--'}</p>
						</li>
					</ul>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Incorporation Details</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-2">
							<p className="text-sm font-medium">Legal Name</p>
							<p className="text-sm font-light">{data?.name}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Country of Incorporation</p>
							<p className="text-sm font-light">{data?.incorporation_country}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Formation Data</p>
							<p className="text-sm font-light">{format(data?.formation_date as string, 'PP')}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Entity Type</p>
							<p className="text-sm font-light uppercase">{data?.company_type}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">{companyRequiredIds[data?.incorporation_country].tax_no}</p>
							<p className="text-sm font-light">{data?.tax_no}</p>
						</li>
						{data?.rn && (
							<li className="grid gap-2">
								<p className="text-sm font-medium">{companyRequiredIds[data?.incorporation_country].rn}</p>
								<p className="text-sm font-light">{data?.rn}</p>
							</li>
						)}
					</ul>
				</div>

				<div>
					<h1 className="mb-4 text-xl font-semibold">Address Details</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-2">
							<p className="text-sm font-medium">State</p>
							<p className="text-sm font-light">{data?.address_state?.name}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Post / Zip Code</p>
							<p className="text-sm font-light">{data?.address_code}</p>
						</li>
						<li className="grid gap-2">
							<p className="text-sm font-medium">Street Address</p>
							<p className="text-sm font-light">{data?.street_address}</p>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
}
