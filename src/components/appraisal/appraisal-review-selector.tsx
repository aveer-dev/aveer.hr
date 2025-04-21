import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';

export const AppraisalReviewSelector = ({
	selectedEmployee,
	teamMembers,
	contract,
	contractAnswer,
	isSelfReviewDueDatePassed,
	handleReviewTypeSelect,
	activeReviewType,
	manager,
	teamMembersAnswers
}: {
	selectedEmployee: Tables<'contracts'>;
	teamMembers?: Tables<'contracts'>[] | null;
	contract: Tables<'contracts'>;
	contractAnswer?: Tables<'appraisal_answers'>;
	isSelfReviewDueDatePassed: boolean;
	handleReviewTypeSelect: (type: 'self' | 'manager' | 'summary', employee: Tables<'contracts'>, answer: Tables<'appraisal_answers'> | null) => void;
	manager?: Tables<'managers'> | null;
	activeReviewType: 'self' | 'manager' | 'summary';
	teamMembersAnswers?: Tables<'appraisal_answers'>[];
}) => {
	const ReviewButtons = ({ employee, answer }: { employee: Tables<'contracts'>; answer: Tables<'appraisal_answers'> | null }) => {
		const isMyContract = employee.id === contract.id;
		const isEmplyeesManager = employee.direct_report == contract.id || (!!manager && employee.team == manager?.team);
		const canViewManagerReview = isEmplyeesManager || (answer && answer?.manager_submission_date !== null);
		const canEditManagerReview = isEmplyeesManager && answer?.status !== 'manager_reviewed';
		const canViewEmployeeReview = isMyContract || (answer && answer?.employee_submission_date !== null);
		const canEditEmployeeReview = isMyContract && !isSelfReviewDueDatePassed;

		return (
			<>
				<Button
					className={cn('gap-2 pl-0 transition-all duration-500 hover:pl-3 focus:pl-3', activeReviewType === 'self' && employee.id === selectedEmployee.id && 'pl-3')}
					variant={activeReviewType === 'self' && employee.id === selectedEmployee.id ? 'secondary' : 'ghost'}
					onClick={() => {
						handleReviewTypeSelect('self', employee, answer);
					}}
					disabled={!canViewEmployeeReview && !canEditEmployeeReview}>
					{isMyContract ? 'Self Review' : 'Employee Review'}
					<Badge variant="outline" className="ml-auto">
						{canEditEmployeeReview ? 'Edit' : canViewEmployeeReview ? 'View' : 'Not Submitted'}
					</Badge>
				</Button>

				<Button
					className={cn('gap-2 pl-0 transition-all duration-500 hover:pl-3 focus:pl-3', activeReviewType === 'manager' && employee.id === selectedEmployee.id && 'pl-3')}
					variant={activeReviewType === 'manager' && employee.id === selectedEmployee.id ? 'secondary' : 'ghost'}
					onClick={() => {
						handleReviewTypeSelect('manager', employee, answer);
					}}
					disabled={!canEditManagerReview && !canViewManagerReview}>
					Manager Review
					<Badge variant="outline" className="ml-auto">
						{canEditManagerReview ? 'Edit' : canViewManagerReview ? 'View' : 'Not Submitted'}
					</Badge>
				</Button>

				<Button
					className={cn('gap-2 pl-0 transition-all duration-500 hover:pl-3 focus:pl-3', activeReviewType === 'manager' && employee.id === selectedEmployee.id && 'pl-3')}
					variant={activeReviewType === 'summary' && employee.id === selectedEmployee.id ? 'secondary' : 'ghost'}
					onClick={() => {
						handleReviewTypeSelect('summary', employee, answer);
					}}
					disabled={!canViewManagerReview || !canViewEmployeeReview}>
					Summary
					<Badge variant="outline" className="ml-auto">
						{!canViewManagerReview || !canViewEmployeeReview ? 'Pending reviews' : 'View'}
					</Badge>
				</Button>
			</>
		);
	};

	return (
		<div className="sticky left-4 z-50 flex h-full w-full max-w-[16rem] flex-col items-center justify-center bg-background/50 [mask-image:linear-gradient(transparent_5%,rgb(0,0,0)_260px,transparent_100%)]">
			<div className="no-scrollbar relative h-full w-full space-y-10 overflow-y-auto px-1 pb-[400px] pt-[200px]">
				{/* Self Review Group */}
				<Collapsible className="!mt-0" defaultOpen>
					<CollapsibleTrigger className="flex items-center gap-4">
						<span className="text-sm font-medium">Personal</span>
					</CollapsibleTrigger>

					<CollapsibleContent className="flex flex-col gap-2">
						<ReviewButtons employee={contract} answer={contractAnswer ?? null} />
					</CollapsibleContent>
				</Collapsible>

				{/* Manager Reviews Group */}
				{!!manager && (
					<div className="space-y-4">
						<h3 className="text-xs font-medium text-muted-foreground">Your team</h3>

						<div className="space-y-8">
							{teamMembers?.map(
								member =>
									member.id !== contract.id && (
										<Collapsible key={member.id} defaultOpen>
											<CollapsibleTrigger className={cn('mb-2 flex w-full gap-2 transition-all duration-500', member.id === selectedEmployee.id && 'border-l-2 border-primary pl-2')}>
												<div className="text-left">
													<h3 className="text-sm font-medium">
														{(member.profile as any)?.first_name} {(member.profile as any)?.last_name}
													</h3>
													<p className="text-xs text-muted-foreground">{member.job_title}</p>
												</div>
											</CollapsibleTrigger>

											<Separator className="my-2" />

											<CollapsibleContent className="flex flex-col gap-1">
												<ReviewButtons employee={member} answer={teamMembersAnswers?.find(answer => answer.contract_id === member.id) ?? null} />
											</CollapsibleContent>
										</Collapsible>
									)
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
