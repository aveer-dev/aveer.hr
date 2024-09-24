import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Info } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updateApplication } from './application.action';
import { Tables, TablesUpdate } from '@/type/database.types';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApplicantBadge } from '@/components/ui/applicant-stage-badge';
import { createClient } from '@/utils/supabase/client';

const stages = ['review', 'interview', 'offer', 'hired', 'reject'];

interface props {
	onUpdateItem: (data: Tables<'job_applications'> & { role: Tables<'roles'> & { policy: Tables<'approval_policies'> } }) => void;
	className?: string;
	applicant: Tables<'job_applications'> & { org: Tables<'organisations'> };
}

const supabase = createClient();

export const UpdateApplication = ({ onUpdateItem, applicant, className }: props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(applicant.stage);
	const [isUpdating, setUpdateState] = useState(false);
	const [showRejectionDialog, toggleRejectionDialog] = useState(false);

	const getDefaultApprovalPolicy = useCallback(async () => {
		const { data, error } = await supabase.from('approval_policies').select().match({ org: applicant.org.subdomain, type: 'role_application', is_default: true });
		if (error) {
			toast.error('Unable to fetch default application review policy', { description: error.message });
			return;
		}

		if (data && data.length > 0) return data[0].levels;
		return;
	}, [applicant.org]);

	const onUpdateApplication = async (stage: string) => {
		setUpdateState(true);

		const applicationLevels = applicant.levels?.length ? applicant.levels : await getDefaultApprovalPolicy();

		const payload: TablesUpdate<'job_applications'> = { stage };
		if (stage == 'interview' && applicationLevels) payload.levels = applicationLevels as any;

		const response = await updateApplication(applicant.id, payload, applicant.org.subdomain);
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
		if (!applicant.levels) getDefaultApprovalPolicy();
	}, [getDefaultApprovalPolicy, onUpdateItem, applicant]);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-40 justify-between', className)}>
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
