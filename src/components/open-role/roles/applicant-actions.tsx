import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Check, ChevronsUpDown, Info, Mail } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { updateApplication } from './application.action';
import { Tables, TablesUpdate } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApplicantBadge } from '@/components/ui/applicant-stage-badge';

const AcceptedApplicantActions = ({ email, name, org }: { email: string; org: string; name: string }) => {
	const [showMailDialog, toggleMailDialog] = useState(false);

	return (
		<div className="flex w-full gap-3 lg:justify-center">
			<Button className="gap-2" size={'icon'} variant="outline" title="Send meeting schedule">
				<span className="sr-only">Send meeting schedule</span>
				<CalendarDays size={12} />
			</Button>

			<Button className="gap-2" onClick={() => toggleMailDialog(true)} size={'icon'} variant="outline" title="Send mail">
				<span className="sr-only">Send mail</span>
				<Mail size={12} />
			</Button>

			<ComposeMailDialog title={`Send message to ${name}`} onClose={state => state == 'success' && toast.success(`Message sent to ${name}`)} isOpen={showMailDialog} toggleDialog={toggleMailDialog} recipients={[email]} name={`Message from ${org}`} />
		</div>
	);
};

const stages = ['review', 'interview', 'offer', 'hired'];

interface props {
	levels?: any[];
	org: string;
	id: number;
	onUpdateItem: (data: Tables<'job_applications'> & { role: Tables<'roles'> & { policy: Tables<'approval_policies'> } }) => void;
	stage: string;
	className?: string;
}

export const UpdateApplication = ({ id, onUpdateItem, stage, org, levels, className }: props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(stage);
	const [isUpdating, setUpdateState] = useState(false);

	const onUpdateApplication = async (stage: string) => {
		setUpdateState(true);

		const payload: TablesUpdate<'job_applications'> = { stage };
		if (stage == 'interview') payload.levels = levels;

		const response = await updateApplication(id, payload, org);
		setUpdateState(false);

		if (typeof response == 'string') return toast('😭 Error', { description: response });

		toast.success('Done!', { description: `Applicant has been moved to stage ${stage}` });
		onUpdateItem(response as any);
		setValue(response.stage);
	};

	useEffect(() => {
		const setToReview = async () => {
			const response = await updateApplication(id, { stage: 'review' }, org);
			if (typeof response == 'string') return toast('😭 Error', { description: response });
			onUpdateItem(response as any);
			setValue(response.stage);
		};

		if (stage == 'applicant') setToReview();
	}, [id, onUpdateItem, org, stage]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-[200px] justify-between', className)}>
					Stage:
					<div className="flex items-center gap-1">
						{isUpdating && <LoadingSpinner />}
						<ApplicantBadge stage={value} />
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandList>
						<CommandEmpty>No stage found.</CommandEmpty>
						<CommandGroup>
							{stages.map(stage => (
								<CommandItem
									className="items-center gap-1"
									key={stage}
									value={stage}
									onSelect={currentValue => {
										onUpdateApplication(currentValue);
										setOpen(false);
									}}>
									<Check className={cn('mr-2 h-4 w-4', value === stage ? 'opacity-100' : 'opacity-0')} />

									<ApplicantBadge stage={stage} />

									{stage == 'interview' && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="flex h-4 w-4 items-center justify-center p-0 text-muted-foreground">
														<Info size={12} />
													</div>
												</TooltipTrigger>
												<TooltipContent>
													<p className="max-w-32 text-muted-foreground">This option will start application policy process, if any.</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export const ApplicantActions = ({ id, onUpdateItem, name, stage, email, orgName, className }: { className?: string; name: string; id: number; email: string; orgName: string; onUpdateItem: (stage: string) => void; stage: string }) => {
	const [showRejectionDialog, toggleRejectionDialog] = useState(false);

	return (
		<>
			{/* {stage == 'applicant' && (
				<UpdateApplication
					id={id}
					onUpdateItem={stage => {
						if (stage !== 'rejected') return onUpdateItem(stage);
						toggleRejectionDialog(stage == 'rejected');
					}}
					stage={stage}
				/>
			)} */}

			{stage !== 'rejected' && stage != 'applicant' && <AcceptedApplicantActions name={name} org={orgName} email={email} />}

			<ComposeMailDialog
				isOpen={showRejectionDialog}
				toggleDialog={toggleRejectionDialog}
				subject={`${name} application update`}
				recipients={[email]}
				name={`Update from ${orgName}`}
				onClose={state => {
					onUpdateItem(stage);
					if (state == 'success') toast.success('Application update sent');
				}}
				title="Send rejection email"
				description="Send a message to applicant about this rejection."
				message={`Hey ${name},

Thanks for taking the time to meet with us recently and for your interest in ${orgName}. We appreciate the chance to get to know you.

We've received many applications for the role and decided to consider other applicants for now. We will certainly reach out if new opportunities arise in the future.

All the best.
HR at ${orgName}`}
			/>
		</>
	);
};
