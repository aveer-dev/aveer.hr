import { Tables } from '@/type/database.types';
import { ProfileForm } from './profile-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface props {
	data:
		| (Tables<'profiles'> & {
				nationality: Tables<'countries'>;
				address: { street_address: string; state: string; code: string; country: string };
				emergency_contact: { first_name: string; last_name: string; mobile: string; email: string; relationship: string };
				medical: { blood_type: string; gentype: string; allergies: string; medical_condition: string; note: string };
		  })
		| null;
	type: 'profile' | 'org';
}

export const Profile = ({ data, type }: props) => {
	return (
		<section className="mt-6">
			<div className={cn('mb-4 flex items-center justify-between', type == 'profile' && 'mb-14')}>
				<h2 className={cn(type == 'profile' ? 'text-4xl font-light' : 'text-lg font-semibold text-support')}>Personal Details</h2>

				{type == 'profile' && <ProfileForm data={data as any} />}
			</div>

			<ul className="grid gap-x-5 gap-y-6 pt-6 text-sm font-light sm:grid-cols-2">
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Full name</h4>{' '}
					<p className="font-normal">
						{data?.first_name} {data?.last_name}
					</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Gender</h4> <p className="font-normal capitalize">{data?.gender || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Email</h4> <p className="font-normal">{data?.email}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Country of origin</h4> <p className="font-normal">{data?.nationality?.name || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Mobile number</h4> <p className="font-normal">{data?.mobile ? `${data?.mobile}` : '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Date of birth</h4> <p className="font-normal">{data?.date_of_birth ? `${format(data?.date_of_birth, 'PP')}` : '-'}</p>
				</li>
			</ul>

			<h2 className="mb-4 mt-16 text-lg font-semibold text-support">Address</h2>
			<ul className="grid gap-x-5 gap-y-6 border-t pt-6 text-sm font-light sm:grid-cols-2">
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Country of residence</h4> <p className="font-normal">{data?.address?.country || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">State / City / Province</h4> <p className="font-normal">{data?.address?.state || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Post code / zip code</h4> <p className="font-normal capitalize">{data?.address?.code || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Street address</h4> <p className="font-normal">{data?.address?.street_address || '-'}</p>
				</li>
			</ul>

			<h2 className="mb-4 mt-16 text-lg font-semibold text-support">Emergency Contact</h2>
			<ul className="grid gap-x-5 gap-y-6 border-t border-t-border pt-6 text-sm font-light sm:grid-cols-2">
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">First name</h4> <p className="font-normal">{data?.emergency_contact?.first_name || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Last name</h4> <p className="font-normal">{data?.emergency_contact?.last_name || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Relationship</h4> <p className="font-normal capitalize">{data?.emergency_contact?.relationship || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Email</h4> <p className="font-normal">{data?.emergency_contact?.email || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Mobile number</h4> <p className="font-normal">{data?.emergency_contact?.mobile || '-'}</p>
				</li>
			</ul>

			<h2 className="mb-4 mt-16 text-lg font-semibold text-support">Medical Record</h2>
			<ul className="grid gap-x-5 gap-y-6 border-t border-t-border pt-6 text-sm font-light sm:grid-cols-2">
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Blood type</h4> <p className="font-normal">{data?.medical?.blood_type || '-'}</p>
				</li>
				<li className="grid gap-1">
					<h4 className="text-xs text-muted-foreground">Genotype</h4> <p className="font-normal">{data?.medical?.gentype || '-'}</p>
				</li>
				<li className="col-span-2 grid gap-1">
					<h4 className="text-xs text-muted-foreground">Allergies</h4> <p className="font-normal capitalize">{data?.medical?.allergies || '-'}</p>
				</li>
				<li className="col-span-2 grid gap-1">
					<h4 className="text-xs text-muted-foreground">Medical condition</h4> <p className="font-normal">{data?.medical?.medical_condition || '-'}</p>
				</li>
				<li className="col-span-2 grid gap-1">
					<h4 className="text-xs text-muted-foreground">Medical note</h4> <p className="font-normal">{data?.medical?.note || '-'}</p>
				</li>
			</ul>
		</section>
	);
};
