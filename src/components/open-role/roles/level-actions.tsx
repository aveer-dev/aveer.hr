import { TablesUpdate } from '@/type/database.types';
import { APPLICANT, LEVEL } from '@/type/roles.types';
import { useState } from 'react';
import { updateApplication } from './application.action';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { CalendarRange, Mail, MessageSquareReply } from 'lucide-react';
import { ComposeMailDialog } from '@/components/ui/mail-dialog';
import { buttonVariants, Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface props {
	role: 'admin' | 'manager' | 'employee' | null;
	levels: LEVEL[];
	index: number;
	level: LEVEL;
	userId?: string;
	applicantData: APPLICANT;
	setApplicantData: (data: APPLICANT) => void;
}

export const LevelsAction = ({ index, level, userId, applicantData, setApplicantData, levels, role }: props) => {
	const [feedback, setFeedback] = useState('');
	const [isSubmiting, setSubmitState] = useState({ reject: false, approve: false });
	const [showFeedback, setFeedbackState] = useState(false);

	const onUpdateApplication = async (id: number, payload: TablesUpdate<'job_applications'>) => {
		const response = await updateApplication(id, payload, applicantData.org.subdomain);
		if (typeof response == 'string') return toast.error('Error updating application', { description: response });
		setApplicantData(response as any);
	};

	const submitFeedback = async (level: LEVEL, action: string, index: number) => {
		if (!feedback) return;
		setSubmitState({ ...isSubmiting, [action]: true });

		const newLevels = (applicantData.levels as unknown as LEVEL[]).map(lv => {
			const item: LEVEL = { id: lv.id, level: lv.level, type: lv.type };
			lv.action && (item.action = lv.action);
			lv.created_at && (item.created_at = lv.created_at);
			lv.feedback && (item.feedback = lv.feedback);
			return item;
		});

		const newLevel: LEVEL = { id: userId as string, level: level.level, type: level.type, action, feedback, created_at: new Date() };
		newLevels[index] = newLevel;
		await onUpdateApplication(applicantData.id, { levels: newLevels as any });
		setFeedback('');
		setSubmitState({ ...isSubmiting, [action]: false });
	};

	if (levels[index - 1]?.action == 'reject')
		return (
			<li className="relative flex w-full gap-4">
				<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
				<div className="w-full space-y-2">
					<h3 className="text-sm capitalize">{level.type == 'employee' ? `${level.first_name} ${level.last_name}` : level.type}</h3>
					<p className="text-xs text-muted-foreground">Application has been rejected</p>
				</div>
				{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
			</li>
		);

	if ((levels[index - 1] && !levels[index - 1].action) || (!level.action && level.type != role && !level.is_employee))
		return (
			<li className="relative flex w-full gap-4">
				<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
				<div className="w-full space-y-2">
					<h3 className="text-sm capitalize">{level.type == 'employee' ? `${level.first_name} ${level.last_name}` : level.type}</h3>
					<p className="text-xs text-muted-foreground">Pending review</p>
				</div>
				{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
			</li>
		);

	if (!level.action && (level.type == role || level.is_employee) && levels[index - 1]?.action !== 'reject')
		return (
			<li className="relative flex w-full gap-4">
				<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
				<div className="w-full space-y-2">
					<div className="flex flex-col justify-between gap-y-4">
						<h3 className="text-sm capitalize">{level.type == 'employee' ? `${level.first_name} ${level.last_name}` : level.type}</h3>

						{!showFeedback && (
							<div className="space-y-4">
								<Link href={`mailto:${applicantData.email}`} className={cn(buttonVariants({ variant: 'outline' }), 'w-full gap-2 py-5 sm:max-w-80 sm:justify-start')}>
									<CalendarRange size={12} /> Interview
								</Link>

								<ComposeMailDialog
									title={`Send message to ${applicantData.first_name}`}
									onClose={state => state == 'success' && toast.success(`Message sent to ${applicantData.first_name}`)}
									recipients={[applicantData.email]}
									name={`Message from ${applicantData.org}`}>
									<Button className="w-full gap-2 py-5 sm:max-w-80 sm:justify-start" variant={'outline'}>
										<Mail size={12} /> Message
									</Button>
								</ComposeMailDialog>

								<Button onClick={() => setFeedbackState(!showFeedback)} className="w-full gap-2 py-5 sm:max-w-80 sm:justify-start" variant={'outline'}>
									<MessageSquareReply size={12} /> Give feedback
								</Button>
							</div>
						)}
					</div>

					{showFeedback && (
						<form className="w-full space-y-2" onSubmit={event => event.preventDefault()}>
							<Label htmlFor="feedback">Feedback</Label>
							<Textarea placeholder="Feedback from applicant review/interview." onChange={event => setFeedback(event.target.value)} value={feedback} required className="w-full" id="feedback" name="feedback" />

							<div className="flex items-center justify-between">
								<Button type="button" variant={'ghost'} onClick={() => setFeedbackState(!showFeedback)}>
									Cancel
								</Button>

								<div className="flex items-center gap-2">
									<Button disabled={isSubmiting.approve || isSubmiting.reject} onClick={() => submitFeedback(level, 'reject', index)} size={'sm'} variant={'outline'}>
										{isSubmiting.reject && <LoadingSpinner />}
										Reject
									</Button>
									<Button disabled={isSubmiting.approve || isSubmiting.reject} onClick={() => submitFeedback(level, 'approve', index)} size={'sm'}>
										{isSubmiting.approve && <LoadingSpinner />}
										Approve
									</Button>
								</div>
							</div>
						</form>
					)}
				</div>
				{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
			</li>
		);

	if (level.action && levels[index - 1]?.action !== 'reject' && levels.find(level => level?.action !== 'reject'))
		return (
			<li className="relative flex w-full gap-4">
				<div className="mt-2 h-2 w-2 rounded-full bg-foreground"></div>
				<div className="w-full space-y-2">
					<div className="flex items-center gap-2">
						<h3 className="text-sm capitalize">
							{level.first_name} {level.last_name}
						</h3>
						<Badge variant={level.action == 'approve' ? 'secondary-success' : level.action == 'reject' ? 'secondary-destructive' : 'secondary'} className="px-2 py-px text-[10px]">
							{level.action}
						</Badge>
					</div>
					<p className="text-xs capitalize text-muted-foreground">{level.type}</p>
					<Card className="max-h-28 overflow-y-auto p-2 text-xs font-light leading-5 text-muted-foreground">{level.feedback}</Card>
				</div>
				{index !== levels.length - 1 && <Separator className="absolute left-[3px] top-10" orientation="vertical" />}
			</li>
		);
};
