import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/utils/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { getApplicants, getBoardingRequests, getLeaveRequests } from '@/components/contract/contract-assignments/utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tables } from '@/type/database.types';

export const Todos = async ({ profile, contractId, org, team }: { profileId?: string; org: string; contractId: number; team: number; profile: Tables<'profiles'> }) => {
	const supabase = createClient();

	if (!profile) return;

	const profileTodos: { label: string; id: string; done: boolean }[] = [
		{ id: 'basic', label: 'Provide basic information', done: true },
		{ id: 'emergency', label: 'Provide emergency contact', done: true },
		{ id: 'address', label: 'Provide physical address', done: true },
		{ id: 'medical', label: 'Provide medical details', done: true }
	];

	if (profile && (!profile.nationality || !profile.email || !profile.gender || !profile.mobile)) profileTodos[0].done = false;
	if ((profile && !(profile.emergency_contact as any)?.first_name) || !(profile.emergency_contact as any)?.last_name || !(profile.emergency_contact as any)?.mobile || !(profile.emergency_contact as any)?.relationship) profileTodos[1].done = false;
	if ((profile && !(profile.address as any)?.street_address) || !(profile.address as any)?.state || !(profile.address as any)?.code || !(profile.address as any)?.country) profileTodos[2].done = false;
	if ((profile && !(profile.medical as any)?.blood_type) || !(profile.medical as any)?.gentype || !(profile.medical as any)?.allergies || !(profile.medical as any)?.medical_condition) profileTodos[3].done = false;

	const manager = (await supabase.from('managers').select().match({ org, person: contractId, team: team })).data;

	const leaveRequests = await getLeaveRequests({ org, contract: contractId, manager: manager && manager.length > 0 ? manager[0] : undefined });

	const applicants = await getApplicants({ org, contract: contractId, manager: manager && manager.length > 0 ? manager[0] : undefined });

	const boardingRequests = await getBoardingRequests({ org, contract: contractId, manager: manager && manager.length > 0 ? manager[0] : undefined });

	return (
		<section>
			<h2 className="mb-4 ml-2 text-sm font-normal text-support">Todos</h2>

			<div className="flex overflow-hidden rounded-3xl bg-muted/60 p-4">
				<ul className="max-h-72 min-h-72 w-full max-w-[16rem] space-y-1 overflow-y-auto rounded-2xl bg-background px-8 py-4 text-sm drop-shadow-sm">
					<li className="w-full">
						<Link href={`#profile`} className={cn(buttonVariants({ variant: 'ghost' }), 'group h-[unset] w-full justify-between rounded-md p-2 px-3 py-3 font-medium transition-all duration-500')}>
							Profile <span className="w-6 rounded-md bg-muted p-1 text-center text-[10px] transition-all duration-500 group-hover:bg-foreground/10">{profileTodos.length}</span>
						</Link>
					</li>
					<li className="w-full">
						<Link href={`#leave`} className={cn(buttonVariants({ variant: 'ghost' }), 'group h-[unset] w-full justify-between rounded-md p-2 px-3 py-3 font-medium transition-all duration-500')}>
							Leave reviews <span className="w-6 rounded-md bg-muted p-1 text-center text-[10px] transition-all duration-500 group-hover:bg-foreground/10">{leaveRequests?.length || 0}</span>
						</Link>
					</li>
					<li className="w-full">
						<Link href={`#applicants`} className={cn(buttonVariants({ variant: 'ghost' }), 'group h-[unset] w-full justify-between rounded-md p-2 px-3 py-3 font-medium transition-all duration-500')}>
							Job applicants review <span className="w-6 rounded-md bg-muted p-1 text-center text-[10px] transition-all duration-500 group-hover:bg-foreground/10">{(typeof applicants !== 'string' && applicants?.length) || 0}</span>
						</Link>
					</li>
					<li className="w-full">
						<Link href={`#boarding`} className={cn(buttonVariants({ variant: 'ghost' }), 'group h-[unset] w-full justify-between rounded-md p-2 px-3 py-3 font-medium transition-all duration-500')}>
							Boarding review <span className="w-6 rounded-md bg-muted p-1 text-center text-[10px] transition-all duration-500 group-hover:bg-foreground/10">{(typeof boardingRequests !== 'string' && boardingRequests?.length) || 0}</span>
						</Link>
					</li>
				</ul>

				<div className="max-h-72 w-full overflow-auto py-4">
					<div className="mx-auto max-w-96 space-y-8">
						<ul id="profile" className="space-y-4">
							<h3 className="mb-2 text-base font-semibold">Profile</h3>

							{profileTodos.map(todo => (
								<li key={todo.id}>
									<Link href={`./profile`} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
										<div className="flex items-center gap-3">
											<Checkbox disabled checked={todo.done} /> {todo.label}
										</div>

										<ChevronRight size={12} />
									</Link>
								</li>
							))}
						</ul>

						{leaveRequests && leaveRequests?.length > 0 && (
							<ul id="leave" className="space-y-4">
								<h3 className="mb-2 text-base font-semibold">Leave reviews</h3>

								{leaveRequests?.map(request => (
									<li key={request.id}>
										<Link href={`./requests`} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
											<div className="flex items-center gap-3">
												<Checkbox disabled /> {request.profile?.first_name} {request.profile?.last_name}
											</div>
											<ChevronRight size={12} />
										</Link>
									</li>
								))}
							</ul>
						)}

						{typeof applicants !== 'string' && applicants && applicants.length > 0 && (
							<ul id="applicants" className="space-y-4">
								<h3 className="mb-2 text-base font-semibold">Job applicants review</h3>

								{applicants.map(applicant => (
									<li key={applicant.id}>
										<Link href={`./requests`} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
											<div className="flex items-center gap-3">
												<Checkbox disabled /> {applicant.first_name} {applicant.last_name}
											</div>
											<ChevronRight size={12} />
										</Link>
									</li>
								))}
							</ul>
						)}

						{typeof boardingRequests !== 'string' && boardingRequests && boardingRequests.length > 0 && (
							<ul id="boarding" className="space-y-4">
								<h3 className="mb-2 text-base font-semibold">Boarding reviews</h3>

								{boardingRequests?.map(boarding => (
									<li key={boarding.id}>
										<Link href={`./requests`} className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
											<div className="flex items-center gap-3">
												<Checkbox disabled /> {boarding.contract.profile?.first_name} {boarding.contract.profile?.last_name}
											</div>
											<ChevronRight size={12} />
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
