// import { Tables } from '@/types/database.types';
// import { ManagerAssessmentAggregate } from './manager-assessment-aggregate';
// import { QuestionGroupAssessment } from './question-group-assessment';
// import { ContractWithProfile } from '@/types/contract';
// import { AppraisalAnswerWithQuestion } from '@/types/appraisal';
// import { TemplateQuestionWithGroup } from '@/types/template';

interface Props {
	// contracts: ContractWithProfile[];
	// answers: Tables<'appraisal_answers'>[];
	// questions: Tables<'template_questions'>[];
	onClose: () => void;
}

// export function AppraisalSummary({ contracts, answers, questions }: Props) {
export function AppraisalSummary({ onClose }: Props) {
	return (
		<div className="space-y-10">
			{/* <ManagerAssessmentAggregate employees={contracts} answers={answers} questions={questions} />

			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="growth_and_development" />

			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="company_values" />

			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="competencies" /> */}
		</div>
	);
}
