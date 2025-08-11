import { Tables } from '@/type/database.types';
import { calculateAppraisalScore } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
	teams: Tables<'teams'>[];
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

export const TeamScoreSummary = ({ teams, contracts, answers }: Props) => {
	// Map teamId to contracts (employees) in that team
	const teamMembersMap: Record<number, typeof contracts> = {};
	contracts.forEach(contract => {
		if (contract.team) {
			if (!teamMembersMap[contract.team]) teamMembersMap[contract.team] = [];
			teamMembersMap[contract.team].push(contract);
		}
	});

	// Aggregate team scores
	const teamScores = teams.map(team => {
		const members = teamMembersMap[team.id] || [];
		const memberScores = members
			.map(contract => {
				const answer = answers?.find(a => a.contract_id === contract.id);
				const score = calculateAppraisalScore({
					answer,
					isSubmitted: !!answer?.employee_submission_date,
					isManagerReviewed: !!answer?.manager_submission_date
				});
				return score?.finalScore;
			})
			.filter((score): score is number => typeof score === 'number');
		const aggregateScore = memberScores.length > 0 ? Math.round(memberScores.reduce((a, b) => a + b, 0) / memberScores.length) : undefined;
		return {
			team,
			aggregateScore,
			memberCount: members.length
		};
	});

	const getScoreRange = (score: number) => {
		return scoreRanges.findIndex(range => score >= range.min && score <= range.max);
	};

	return (
		<div className="space-y-4">
			{teams.length === 0 ? (
				<Card className="flex h-32 items-center justify-center text-xs text-muted-foreground">No teams found.</Card>
			) : (
				teamScores.map(({ team, aggregateScore, memberCount }) => {
					const scoreRangeIndex = typeof aggregateScore === 'number' ? getScoreRange(aggregateScore) : -1;
					return (
						<div key={team.id} className="flex items-center justify-between rounded-md border px-4 py-3">
							<div className="w-full max-w-lg">
								<p className="text-sm font-medium">{team.name}</p>
								{memberCount === 0 && <span className="text-xs text-muted-foreground">No employees</span>}
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
				})
			)}
		</div>
	);
};
