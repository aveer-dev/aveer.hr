import { GOAL_SCORE, Objective } from '@/components/appraisal/appraisal.types';
import { Tables } from '@/type/database.types';

export interface ScoreResult {
	totalPossibleScore: number;
	employeeScore: number;
	managerScore: number;
	finalScore: number;
	employeeScorePercentage: number;
	managerScorePercentage: number;
	totalGoals: number;
}

interface CalculateScoreParams {
	answer?: Tables<'appraisal_answers'>;
	isSubmitted: boolean;
	isManagerReviewed: boolean;
	employeePercentage?: number;
	managerPercentage?: number;
}

export const calculateAppraisalScore = ({ answer, isSubmitted, isManagerReviewed, employeePercentage = 30, managerPercentage = 70 }: CalculateScoreParams): ScoreResult | undefined => {
	if (!answer || !isSubmitted || !isManagerReviewed) return;

	const objectives = answer?.objectives as unknown as Objective[];
	if (!objectives?.length) return;

	// Calculate total number of goals across all objectives
	const totalGoals = objectives.reduce((total, objective) => total + (objective.goals?.length || 0), 0);
	if (totalGoals === 0) return;

	// Calculate total possible score (5 points per goal)
	const totalPossibleScore = totalGoals * 5;

	// Calculate raw scores from employee and manager goal scores
	const employeeScore = (answer?.employee_goal_score as unknown as GOAL_SCORE[])?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
	const managerScore = (answer?.manager_goal_score as unknown as GOAL_SCORE[])?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;

	// Calculate weighted scores
	const employeeWeightedScore = (employeeScore / totalPossibleScore) * employeePercentage;
	const managerWeightedScore = (managerScore / totalPossibleScore) * managerPercentage;

	// Calculate final score (out of 100)
	const finalScore = employeeWeightedScore + managerWeightedScore;

	return {
		totalPossibleScore,
		employeeScore,
		managerScore,
		finalScore,
		employeeScorePercentage: (employeeScore / totalPossibleScore) * 100,
		managerScorePercentage: (managerScore / totalPossibleScore) * 100,
		totalGoals
	};
};
