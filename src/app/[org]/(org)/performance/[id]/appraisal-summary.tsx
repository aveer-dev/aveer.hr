import { Tables } from '@/type/database.types';
import { ManagerAssessmentAggregate } from './manager-assessment-aggregate';
import { QuestionGroupAssessment } from './question-group-assessment';

export const AppraisalSummary = async ({ org, id, contracts, questions, answers }: { org: string; id: string; contracts: (Tables<'contracts'> & { profile: Tables<'profiles'> })[]; questions: Tables<'template_questions'>[]; answers: Tables<'appraisal_answers'>[] }) => {
	return (
		<div className="mt-6 space-y-14">
			<ManagerAssessmentAggregate employees={contracts} answers={answers} questions={questions} />
			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="growth_and_development" />
			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="company_values" />
			<QuestionGroupAssessment employees={contracts} answers={answers} questions={questions} group="competencies" />
		</div>
	);
};
