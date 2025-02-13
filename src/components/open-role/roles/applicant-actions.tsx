import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Info } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updateApplicant, updateApplication } from './application.action';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApplicantBadge } from '@/components/ui/applicant-stage-badge';
import { APPLICANT } from '@/type/roles.types';

const stages = ['review', 'interview', 'offer', 'hired', 'reject'];

interface props {
	onUpdateItem: (data: APPLICANT) => void;
	className?: string;
	applicant: APPLICANT;
}

export const UpdateApplication = ({ onUpdateItem, applicant, className }: props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(applicant.stage);
	const [isUpdating, setUpdateState] = useState(false);
	const [showRejectionDialog, toggleRejectionDialog] = useState(false);

	const onUpdateApplication = async (stage: string) => {
		setUpdateState(true);

		const response = await updateApplicant({ applicant, stage });
		setUpdateState(false);

		if (typeof response == 'string') return toast('😭 Error', { description: response });

		toast.success('Done!', { description: `Applicant has been moved to stage ${stage}` });
		if (stage == 'reject') toggleRejectionDialog(true);

		onUpdateItem(response as any);
		setValue(response.stage);
	};

	useEffect(() => {
		const setToReview = async () => {
			const response = await updateApplication(applicant.id, { stage: 'review' }, applicant.org.subdomain);
			if (typeof response == 'string') return toast('😭 Error', { description: response });
			onUpdateItem(response as any);
			setValue(response.stage);
		};

		if (applicant.stage == 'applicant') setToReview();
	}, [onUpdateItem, applicant]);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" role="combobox" aria-expanded={open} className={cn('h-10 w-40 justify-between', className)}>
						Stage:
						<div className="flex items-center gap-1">
							{isUpdating && <LoadingSpinner />}
							<ApplicantBadge stage={value} />
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-40 p-0" align="start">
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
														<p className="max-w-32 text-[10px] text-muted-foreground">This option will start application policy process, if any.</p>
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

			<ComposeMailDialog
				isOpen={showRejectionDialog}
				toggleDialog={toggleRejectionDialog}
				subject={`${name} application update`}
				recipients={[applicant.email]}
				name={`Update from ${applicant.org.name}`}
				onClose={state => {
					// onUpdateItem(applicant.stage);
					if (state == 'success') toast.success('Application update sent');
				}}
				title="Send rejection email"
				description="Send a message to applicant about this rejection."
				message={`Hey ${applicant.first_name},

Thanks for taking the time to meet with us recently and for your interest in ${applicant.org.name}. We appreciate the chance to get to know you.

We've received many applications for the role and decided to consider other applicants for now. We will certainly reach out if new opportunities arise in the future.

All the best.
HR at ${applicant.org.name}`}
			/>
		</>
	);
};
