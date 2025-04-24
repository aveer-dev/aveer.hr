import { Tables } from '@/type/database.types';
import { calculateAppraisalScore } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Props {
	contracts: (Tables<'contracts'> & {
		profile: {
			first_name: string;
			last_name: string;
		};
	})[];
	answers?: Tables<'appraisal_answers'>[];
}

const scoreRanges = [
	{ label: 'Very Poor', min: 0, max: 20 },
	{ label: 'Poor', min: 21, max: 40 },
	{ label: 'Fair', min: 41, max: 60 },
	{ label: 'Good', min: 61, max: 80 },
	{ label: 'Excellent', min: 81, max: 100 }
];

export const AppraisalScoreSummary = ({ contracts, answers }: Props) => {
	const getScoreRange = (score: number) => {
		return scoreRanges.findIndex(range => score >= range.min && score <= range.max);
	};

	return (
		<div className="mt-10 space-y-6">
			<div className="flex items-center justify-between px-4">
				<div className="w-full max-w-lg"></div>

				<div className="flex gap-4">
					{scoreRanges.map(range => (
						<div key={range.label} className="w-24 text-center">
							<span className="text-xs font-medium text-muted-foreground">{range.label}</span>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				{contracts.map(contract => {
					const answer = answers?.find(a => a.contract_id === contract.id);
					const score = calculateAppraisalScore({
						answer,
						isSubmitted: !!answer?.employee_submission_date,
						isManagerReviewed: !!answer?.manager_submission_date
					});

					const scoreRangeIndex = score ? getScoreRange(score.finalScore) : -1;

					return (
						<div key={contract.id} className="flex items-center justify-between rounded-md border px-4 py-3">
							<div className="w-full max-w-lg">
								<p className="text-sm">
									{contract.profile.first_name} {contract.profile.last_name}
								</p>
							</div>

							<div className="flex gap-4">
								{scoreRanges.map((_, index) => (
									<div key={index} className="w-24 text-center">
										{scoreRangeIndex === index && <Check className="mx-auto h-4 w-4 text-primary" />}
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4 space-y-1 border-t pt-4">
				<p className="text-sm text-muted-foreground">Score Ranges:</p>

				<div className="flex gap-6">
					{scoreRanges.map(range => (
						<div key={range.label} className="flex items-center justify-between gap-2">
							<span className="text-xs text-muted-foreground">{range.label}</span>
							<span className="text-xs text-muted-foreground">
								{range.min}-{range.max}%
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
