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

/* Test cases for perfect scores:
 * Case 1 - With weights (sum = 100):
 * Objective 1 (weight: 60) with 2 goals scoring 5/5 each
 * Objective 2 (weight: 40) with 1 goal scoring 5/5
 * Expected: (5 * 0.6) + (5 * 0.4) = 3 + 2 = 5 -> converts to 100%
 *
 * Case 2 - Without weights (equal distribution):
 * Objective 1 with 2 goals scoring 5/5 each
 * Objective 2 with 1 goal scoring 5/5
 * Expected: (5 * 0.5) + (5 * 0.5) = 2.5 + 2.5 = 5 -> converts to 100%
 */

export const calculateAppraisalScore = ({ answer, isSubmitted, isManagerReviewed, employeePercentage = 30, managerPercentage = 70 }: CalculateScoreParams): ScoreResult | undefined => {
	if (!answer || !isSubmitted || !isManagerReviewed) return;

	const objectives = answer?.objectives as unknown as Objective[];
	if (!objectives?.length) return;

	// Calculate total number of goals
	const totalGoals = objectives.reduce((total, objective) => total + (objective.goals?.length || 0), 0);
	if (totalGoals === 0) return;

	// Check if all objectives have weights and they sum to 100
	const allObjectivesHaveWeights = objectives.every(obj => typeof obj.weight === 'number' && obj.weight > 0);
	const totalWeight = objectives.reduce((sum, obj) => sum + (obj.weight || 0), 0);
	const useObjectiveWeights = allObjectivesHaveWeights && Math.abs(totalWeight - 100) < 0.001; // Using small epsilon for float comparison

	const employeeGoalScores = answer?.employee_goal_score as unknown as GOAL_SCORE[];
	const managerGoalScores = answer?.manager_goal_score as unknown as GOAL_SCORE[];

	let employeeScore = 0;
	let managerScore = 0;
	let goalIndex = 0;

	if (useObjectiveWeights) {
		// Use weighted calculation when all objectives have proper weights
		objectives.forEach(objective => {
			const goalsCount = objective.goals?.length || 0;
			if (goalsCount === 0) return;

			const objectiveWeight = (objective.weight || 0) / 100; // Convert weight to decimal
			let objectiveEmployeeScore = 0;
			let objectiveManagerScore = 0;

			// Sum up scores for all goals in this objective
			for (let i = 0; i < goalsCount; i++) {
				objectiveEmployeeScore += employeeGoalScores[goalIndex]?.score || 0;
				objectiveManagerScore += managerGoalScores[goalIndex]?.score || 0;
				goalIndex++;
			}

			// Calculate weighted average for this objective
			employeeScore += (objectiveEmployeeScore / goalsCount) * objectiveWeight;
			managerScore += (objectiveManagerScore / goalsCount) * objectiveWeight;
		});
	} else {
		// Use equal weights when objectives don't have proper weights
		objectives.forEach(objective => {
			const goalsCount = objective.goals?.length || 0;
			if (goalsCount === 0) return;

			const objectiveWeight = 1 / objectives.length;
			let objectiveEmployeeScore = 0;
			let objectiveManagerScore = 0;

			// Sum up scores for all goals in this objective
			for (let i = 0; i < goalsCount; i++) {
				objectiveEmployeeScore += employeeGoalScores[goalIndex]?.score || 0;
				objectiveManagerScore += managerGoalScores[goalIndex]?.score || 0;
				goalIndex++;
			}

			// Calculate weighted average for this objective
			employeeScore += (objectiveEmployeeScore / goalsCount) * objectiveWeight;
			managerScore += (objectiveManagerScore / goalsCount) * objectiveWeight;
		});
	}

	// Convert scores to percentages (out of 100) and round to whole numbers
	employeeScore = Math.round((employeeScore / 5) * 100);
	managerScore = Math.round((managerScore / 5) * 100);

	// Calculate weighted final score based on employee/manager percentages
	const employeeWeightedScore = Math.round((employeeScore * employeePercentage) / 100);
	const managerWeightedScore = Math.round((managerScore * managerPercentage) / 100);

	// Calculate final score (out of 100)
	const finalScore = employeeWeightedScore + managerWeightedScore;

	return {
		totalPossibleScore: 100, // Maximum score is now 100 (percentage)
		employeeScore: Math.round(employeeScore),
		managerScore: Math.round(managerScore),
		finalScore: Math.round(finalScore),
		employeeScorePercentage: Math.round(employeeScore),
		managerScorePercentage: Math.round(managerScore),
		totalGoals
	};
};
