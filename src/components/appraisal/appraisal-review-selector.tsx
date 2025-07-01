import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tables } from '@/type/database.types';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';

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
		const isEmployeesManager = employee.direct_report === contract.id || (!!manager?.team && employee.team === manager.team);
		const canViewManagerReview = isEmployeesManager || (answer && answer?.manager_submission_date !== null);
		const canEditManagerReview = isEmployeesManager && answer?.status !== 'manager_reviewed';
		const canViewEmployeeReview = isMyContract || (answer && answer?.employee_submission_date !== null);
		const canEditEmployeeReview = isMyContract && !isSelfReviewDueDatePassed;

		return (
			<>
				<Button
					className={cn('gap-2 pl-0 transition-all duration-500 hover:pl-3 focus:pl-3', activeReviewType === 'self' && employee.id === selectedEmployee.id && 'pl-3')}
					variant={activeReviewType === 'self' && employee.id === selectedEmployee.id ? 'secondary' : 'ghost'}
					onClick={() => handleReviewTypeSelect('self', employee, answer)}
					disabled={!canViewEmployeeReview && !canEditEmployeeReview}>
					{isMyContract ? 'Self Review' : 'Employee Review'}
					<Badge variant="outline" className="ml-auto">
						{canEditEmployeeReview ? 'Edit' : canViewEmployeeReview ? 'View' : 'Not Submitted'}
					</Badge>
				</Button>

				<Button
					className={cn('gap-2 pl-0 transition-all duration-500 hover:pl-3 focus:pl-3', activeReviewType === 'manager' && employee.id === selectedEmployee.id && 'pl-3')}
					variant={activeReviewType === 'manager' && employee.id === selectedEmployee.id ? 'secondary' : 'ghost'}
					onClick={() => handleReviewTypeSelect('manager', employee, answer)}
					disabled={!canEditManagerReview && !canViewManagerReview}>
					Manager Review
					<Badge variant="outline" className="ml-auto">
						{canEditManagerReview ? 'Edit' : canViewManagerReview ? 'View' : 'Not Submitted'}
					</Badge>
				</Button>
			</>
		);
	};

	const ReviewOptions = ({ employee, answer }: { employee: Tables<'contracts'>; answer: Tables<'appraisal_answers'> | null }) => {
		const isMyContract = employee.id === contract.id;
		const isEmployeesManager = employee.direct_report === contract.id || (!!manager?.team && employee.team === manager.team);
		const canViewManagerReview = isEmployeesManager || (answer && answer?.manager_submission_date !== null);
		const canEditManagerReview = isEmployeesManager && answer?.status !== 'manager_reviewed';
		const canViewEmployeeReview = isMyContract || (answer && answer?.employee_submission_date !== null);
		const canEditEmployeeReview = isMyContract && !isSelfReviewDueDatePassed;

		return (
			<>
				<SelectItem value={`${employee.id}-self`} className={cn('flex gap-2 transition-all duration-500')}>
					{isMyContract ? 'Self Review' : 'Employee Review'}
					<Badge variant="outline" className="ml-2">
						{canEditEmployeeReview ? 'Edit' : canViewEmployeeReview ? 'View' : 'Not Submitted'}
					</Badge>
				</SelectItem>

				<SelectItem value={`${employee.id}-manager`} className={cn('flex gap-2 transition-all duration-500')} disabled={!canEditManagerReview && !canViewManagerReview}>
					Manager Review
					<Badge variant="outline" className="ml-2">
						{canEditManagerReview ? 'Edit' : canViewManagerReview ? 'View' : 'Not Submitted'}
					</Badge>
				</SelectItem>
			</>
		);
	};

	return (
		<>
			<div className="mt-4 w-full md:hidden">
				<Select
					onValueChange={value => {
						const valueArray = value.split('-');
						const activeEmployee = teamMembers?.find(member => member.id === parseInt(valueArray[0])) ?? contract;
						const activeAnswer = teamMembersAnswers?.find(answer => answer.contract_id === parseInt(valueArray[0])) ?? contractAnswer ?? null;
						handleReviewTypeSelect(valueArray[1] as 'self' | 'manager' | 'summary', activeEmployee, activeAnswer);
					}}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select review" />
					</SelectTrigger>

					<SelectContent>
						<SelectGroup>
							<SelectLabel className="pl-2">Personal</SelectLabel>
							<ReviewOptions employee={contract} answer={contractAnswer ?? null} />
						</SelectGroup>

						{!!manager && (
							<SelectGroup>
								<SelectLabel className="pl-2">Team</SelectLabel>
								{teamMembers?.map(member => member.id !== contract.id && <ReviewOptions key={member.id} employee={member} answer={teamMembersAnswers?.find(answer => answer.contract_id === member.id) ?? null} />)}
							</SelectGroup>
						)}
					</SelectContent>
				</Select>
			</div>

			<div className="no-scrollbar relative hidden h-full w-full max-w-64 space-y-10 overflow-y-auto px-1 md:block">
				{/* Self Review Group */}
				<Collapsible className="!mt-0" defaultOpen>
					<CollapsibleTrigger className="flex items-center gap-4 pb-2">
						<span className="text-sm font-medium">Personal</span>
					</CollapsibleTrigger>

					<CollapsibleContent className="flex flex-col gap-2">
						<ReviewButtons employee={contract} answer={contractAnswer ?? null} />
					</CollapsibleContent>
				</Collapsible>

				{/* Manager Reviews Group */}
				{!!manager && teamMembers && teamMembers.length > 0 && (
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
		</>
	);
};
