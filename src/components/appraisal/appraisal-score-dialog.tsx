import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScoreScale } from '../ui/score-scale';

interface AppraisalScoreDialogProps {
	score: {
		totalGoals: number;
		finalScore: number;
		employeeScorePercentage: number;
		managerScorePercentage: number;
	};
	employeePercentage: number;
	managerPercentage: number;
	trigger?: React.ReactNode;
}

export const AppraisalScoreDialog = ({ score, employeePercentage, managerPercentage, trigger }: AppraisalScoreDialogProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger || <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary/50 text-sm font-medium transition-colors hover:bg-primary/5">{score.finalScore}%</div>}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Performance Score Details</DialogTitle>
				</DialogHeader>

				<div className="space-y-14 pt-4">
					<div className="space-y-5">
						<div className="flex items-center justify-between text-xs">
							<span>Overall Score ({score.totalGoals} goals)</span>
							<span className="font-medium">{score.finalScore.toFixed(1)}%</span>
						</div>
						<ScoreScale value={score.finalScore} height="h-3" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-5">
							<div className="flex items-center justify-between text-xs">
								<span>Self Assessment ({employeePercentage}%)</span>
								<span>{score.employeeScorePercentage.toFixed(1)}%</span>
							</div>
							<ScoreScale value={score.employeeScorePercentage} height="h-2" showLabel={false} />
						</div>

						<div className="space-y-5">
							<div className="flex items-center justify-between text-xs">
								<span>Manager Review ({managerPercentage}%)</span>
								<span>{score.managerScorePercentage.toFixed(1)}%</span>
							</div>
							<ScoreScale value={score.managerScorePercentage} height="h-2" showLabel={false} />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
