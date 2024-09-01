import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { Tables, TablesInsert } from '@/type/database.types';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface props {
	data: any;
	level?: TablesInsert<'employee_levels'>;
	back: Dispatch<SetStateAction<boolean>>;
	submit: () => void;
	nationality?: Tables<'countries'>;
	openCompensationDialog: (state: boolean) => void;
	openBenefitsDialog: (state: boolean) => void;
	openScheduleDialog: (state: boolean) => void;
	isSubmiting: boolean;
	update: boolean;
	formType: 'contract' | 'role';
}

export const ContractDetails = ({ data, level, back, submit, nationality, openCompensationDialog, openBenefitsDialog, isSubmiting, update, formType, openScheduleDialog }: props) => {
	return (
		<section className="mx-auto grid max-w-4xl gap-20">
			{data.first_name && (
				<ul className="grid grid-cols-2 gap-x-5 gap-y-20 border-t border-t-border pt-6">
					<li>
						<div className="mt-4 grid gap-3 text-xs font-light">
							<h2 className="flex items-center gap-3 text-lg font-bold">
								{data?.first_name} {data?.last_name}
								<Badge className="w-fit font-light" variant={'secondary'}>
									{nationality?.name}
								</Badge>
								<Button onClick={() => back(false)} variant={'secondary'} size={'icon'} className="h-[22px] w-8 gap-3">
									<Pencil size={10} />
								</Button>
							</h2>

							<p>Individual</p>
							<p>{data?.email}</p>
						</div>
					</li>
				</ul>
			)}

			{/* role details */}
			<div>
				<div className={cn(data.first_name ? '' : 'mt-8', 'mb-4 flex items-center justify-between')}>
					<h1 className="text-lg font-semibold">Role Details</h1>
					<Button onClick={() => back(false)} variant={'secondary'} size={'icon'} className={cn(data.first_name ? 'h-8' : 'h-5 w-5')}>
						<Pencil size={12} />
					</Button>
				</div>

				<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
					<li className="grid gap-3">
						<h2 className="text-sm font-medium">Job Title</h2>
						<p className="text-sm font-light">{data?.job_title}</p>
					</li>
					<li className="grid gap-3">
						<h2 className="text-sm font-medium">Seniority Level</h2>
						<p className="text-sm font-light">
							{level?.level} {level?.role ? '•' : ''} {level?.role}
						</p>
					</li>
					<li className="grid gap-3">
						<h2 className="text-sm font-medium">Employment Type</h2>
						<p className="text-sm font-light capitalize">{data?.employment_type}</p>
					</li>
					<li className="grid gap-3">
						<h2 className="text-sm font-medium">Work Schedule</h2>
						<p className="text-sm font-light">
							{data?.work_schedule}hrs, {data?.work_shedule_interval}
						</p>
					</li>
				</ul>

				<div className="mt-10 grid gap-4">
					<h2 className="text-sm font-bold">Job Responsibilities</h2>
					<ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.responsibilities as string[])?.map((responsibility, index) => <li key={index}>{responsibility}</li>)}</ul>
				</div>
			</div>

			{/* requirements */}
			{formType == 'role' && (
				<div>
					<h1 className="mb-4 text-lg font-semibold">Job Requirements</h1>
					<ul className="grid items-start gap-x-5 gap-y-10 border-t border-t-border pt-8">
						<li className="grid gap-3">
							<h2 className="text-sm font-medium">Experience</h2>
							<p className="text-sm font-light">{data?.years_of_experience} years</p>
						</li>

						<li className="grid gap-3">
							<h2 className="text-sm font-medium">Job Requirements</h2>
							<ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.requirements as string[])?.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>
						</li>
					</ul>
				</div>
			)}

			{/* compensation */}
			<div>
				<h1 className="mb-4 text-lg font-semibold">Compensation</h1>
				<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Salary
							<Button onClick={() => openCompensationDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(Number(data?.salary))}
						</p>
					</li>

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Signing Bonus
							<Button onClick={() => openCompensationDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">
							{data?.signing_bonus
								? new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD'
									}).format(Number(data?.signing_bonus))
								: '--'}
						</p>
					</li>

					<li className="grid h-fit gap-4">
						<h2 className="flex h-fit items-center gap-2 text-sm font-medium">
							Additional offerings{' '}
							<Button onClick={() => openBenefitsDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>

						{data?.additional_offerings?.length > 0 && <ul className="ml-3 grid list-disc gap-4 text-sm font-light">{(data?.additional_offerings as string[])?.map((offering, index) => <li key={index}>{offering}</li>)}</ul>}
						{data?.additional_offerings?.length == 0 && <p className="ml-3 grid list-disc gap-4 text-sm font-light italic text-muted-foreground">No additional offering set</p>}
					</li>

					{data?.fixed_allowance?.length > 0 && (
						<li className="grid h-fit max-w-72 gap-4">
							<h2 className="flex h-fit items-center gap-2 text-sm font-medium">
								Fixed Allowances
								<Button onClick={() => openCompensationDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
									<Pencil size={10} />
								</Button>
							</h2>
							<ul className="grid list-disc gap-4 pl-3 text-sm font-light">
								{(data?.fixed_allowance as { name: string; frequency: string; amount: string }[])?.map((allowance, index) => (
									<li key={index}>
										<div className="flex items-baseline justify-between p-1 font-light">
											<div>
												{allowance.name} •{' '}
												<span className="text-xs font-light text-muted-foreground">
													{new Intl.NumberFormat('en-US', {
														style: 'currency',
														currency: 'USD'
													}).format(Number(allowance.amount))}
												</span>
											</div>
											<div className="text-xs capitalize text-muted-foreground">{allowance.frequency.replace('-', ' ')}</div>
										</div>
									</li>
								))}
							</ul>
						</li>
					)}
				</ul>
			</div>

			{/* job schedule */}
			<div>
				<h1 className="mb-4 text-lg font-semibold">Job Schedule</h1>

				<ul className="grid grid-cols-2 gap-x-5 gap-y-10 border-t border-t-border pt-8">
					{formType == 'contract' && (
						<>
							<li className="grid gap-3">
								<h2 className="flex items-center gap-2 text-sm font-medium">
									Employment Start Date
									<Button onClick={() => back(false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
										<Pencil size={10} />
									</Button>
								</h2>
								<p className="text-sm font-light">{format(data?.start_date as string, 'PP')}</p>
							</li>

							{data?.end_date && (
								<li className="grid gap-3">
									<h2 className="flex items-center gap-2 text-sm font-medium">
										Employment End Date
										<Button onClick={() => back(false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
											<Pencil size={10} />
										</Button>
									</h2>
									<p className="text-sm font-light">{format(data?.end_date as string, 'PP')}</p>
								</li>
							)}
						</>
					)}

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Leave
							<Button onClick={() => openScheduleDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.paid_leave} Days</p>
					</li>

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Sick Leave
							<Button onClick={() => openScheduleDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.sick_leave} Days</p>
					</li>

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Probation Period
							<Button onClick={() => openScheduleDialog(true)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.probation_period} Days</p>
					</li>
				</ul>
			</div>

			<div className="flex justify-end gap-4 border-t border-t-border pt-8">
				<Button
					onClick={() => {
						window.scrollTo({ top: 0, behavior: 'smooth' });
						back(false);
					}}
					variant={'outline'}>
					Back
				</Button>

				<Button onClick={submit} disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
					{isSubmiting && <LoadingSpinner />}
					{formType == 'contract' && <>{isSubmiting ? (update ? 'Updating person' : 'Adding person') : update ? 'Update person' : 'Add person'}</>}
					{formType == 'role' && <>{isSubmiting ? (update ? 'Updating role' : 'Creating role') : update ? 'Update role' : 'Create role'}</>}
				</Button>
			</div>
		</section>
	);
};
