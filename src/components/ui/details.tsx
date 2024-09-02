'use client';

import { Button } from './button';
import { Pencil } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface props {
	back?: (action: boolean) => void;
	openCompensationDialog?: (action: boolean) => void;
	openBenefitsDialog?: (action: boolean) => void;
	openScheduleDialog?: (action: boolean) => void;
	data: any;
	formType: 'role' | 'contract';
}

export const Details = ({ data, back, formType, openCompensationDialog, openBenefitsDialog, openScheduleDialog }: props) => {
	return (
		<>
			{data.first_name && (
				<ul className="grid grid-cols-2 gap-x-5 gap-y-20 border-t border-t-border pt-6">
					<li>
						<div className="mt-4 grid gap-3 text-xs font-light">
							<h2 className="flex items-center gap-3 text-lg font-bold">
								{data?.first_name} {data?.last_name}
								<Badge className="w-fit font-light" variant={'secondary'}>
									{data.nationality?.name}
								</Badge>
								<Button onClick={() => (back ? back(false) : false)} variant={'secondary'} size={'icon'} className="h-[22px] w-8 gap-3">
									<Pencil size={10} />
								</Button>
							</h2>

							<p>Individual</p>
							<p>{data?.email}</p>
						</div>
					</li>
				</ul>
			)}

			{data?.organisations && data?.profile && (
				<div>
					<h1 className="mb-4 text-xl font-semibold">Parties</h1>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-20 border-t border-t-border pt-6">
						<li>
							<h2 className="text-sm text-muted-foreground">Employer</h2>
							<div className="mt-4 grid gap-3 text-xs font-light">
								<p className="text-xl font-bold">{data?.organisations?.name}</p>
								{!data?.org_signed && <p className="mt-4 text-xs">Pending signature from company</p>}
								{data?.org_signed && (
									<>
										<p>
											{data?.signed_by?.first_name} {data?.signed_by?.last_name}
										</p>
										<p>{data?.signed_by?.email}</p>
										<p>
											{data?.entity.address_code} {data?.entity.street_address}, {data?.entity.address_state}, {data?.entity.incorporation_country}
										</p>
									</>
								)}
							</div>
						</li>

						<li>
							<h2 className="text-sm text-muted-foreground">Employee</h2>

							<div className="mt-4 grid gap-3 text-xs font-light">
								<p className="text-xl font-bold">
									{data?.profile?.first_name} {data?.profile?.last_name}
								</p>

								{!data?.profile_signed && <p className="mt-4 text-xs">Pending your signature</p>}
								{data?.profile_signed && (
									<>
										<p>Individual</p>
										<p>{data?.profile?.email}</p>
										<p>{data?.profile?.nationality}</p>
									</>
								)}
							</div>
						</li>

						{data.terminated_by && (
							<li>
								<h2 className="text-sm text-muted-foreground">Terminated by</h2>

								<div className="mt-4 grid gap-3 text-xs font-light">
									<p className="text-xl font-bold">
										{data?.terminated_by?.first_name} {data?.terminated_by?.last_name}
									</p>
									<p>{data?.terminated_by?.email}</p>
								</div>
							</li>
						)}
					</ul>
				</div>
			)}

			{/* role details */}
			<div>
				<div className={cn(data.first_name ? '' : 'mt-8', 'mb-4 flex items-center justify-between')}>
					<h1 className="text-lg font-semibold">Role Details</h1>
					<Button onClick={() => (back ? back(false) : false)} variant={'secondary'} size={'icon'} className={cn(data.first_name ? 'h-8' : 'h-5 w-5')}>
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
							{data.level?.level} {data.level?.role ? '•' : ''} {data.level?.role}
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
							<Button onClick={() => (openCompensationDialog ? openCompensationDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
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
							<Button onClick={() => (openCompensationDialog ? openCompensationDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
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
							<Button onClick={() => (openBenefitsDialog ? openBenefitsDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
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
								<Button onClick={() => (openCompensationDialog ? openCompensationDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
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
									<Button onClick={() => (back ? back(false) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
										<Pencil size={10} />
									</Button>
								</h2>
								<p className="text-sm font-light">{format(data?.start_date as string, 'PP')}</p>
							</li>

							{data?.end_date && (
								<li className="grid gap-3">
									<h2 className="flex items-center gap-2 text-sm font-medium">
										Employment End Date
										<Button onClick={() => (back ? back(false) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
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
							<Button onClick={() => (openScheduleDialog ? openScheduleDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.paid_leave} Days</p>
					</li>

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Sick Leave
							<Button onClick={() => (openScheduleDialog ? openScheduleDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.sick_leave} Days</p>
					</li>

					<li className="grid gap-3">
						<h2 className="flex items-center gap-2 text-sm font-medium">
							Probation Period
							<Button onClick={() => (openScheduleDialog ? openScheduleDialog(true) : false)} variant={'secondary'} size={'icon'} className="h-5 w-5 gap-3 text-muted-foreground">
								<Pencil size={10} />
							</Button>
						</h2>
						<p className="text-sm font-light">{data?.probation_period} Days</p>
					</li>
				</ul>
			</div>
		</>
	);
};