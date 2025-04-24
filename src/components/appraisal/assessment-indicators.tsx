import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function ScaleIndicator({ value, max = 5 }: { value: number; max?: number }) {
	return (
		<div className="flex items-center gap-1">
			<div className="flex w-full gap-0.5">
				{Array.from({ length: max }).map((_, i) => (
					<Button key={i} variant={i == value ? 'secondary_success' : 'outline'} className="disabled:opacity-100" disabled size="icon">
						{i + 1}
					</Button>
				))}
			</div>
		</div>
	);
}

export function YesNoIndicator({ value }: { value: 'yes' | 'no' }) {
	return (
		<div className="flex items-center gap-2">
			<Button variant={value === 'yes' ? 'secondary_success' : 'outline'} className="disabled:opacity-100" disabled size="icon">
				Yes
			</Button>
			<Button variant={value === 'no' ? 'secondary_success' : 'outline'} className="disabled:opacity-100" disabled size="icon">
				No
			</Button>
		</div>
	);
}

export function AnswerDisplay({ question, answer }: { question: any; answer: any }) {
	if (!answer) return <p className="text-xs font-light italic text-muted-foreground">No answer provided</p>;

	switch (question.type) {
		case 'textarea':
			return (
				<p className="whitespace-pre-wrap text-sm font-medium">
					<span className="font-light text-muted-foreground">Answer:</span> {answer}
				</p>
			);
		case 'yesno':
			return <YesNoIndicator value={answer as 'yes' | 'no'} />;
		case 'scale':
			return <ScaleIndicator value={answer as number} />;
		case 'multiselect':
			return (
				<div className="flex flex-wrap gap-2">
					{answer.map((option: string) => (
						<span key={option} className="rounded-full bg-secondary px-2 py-1 text-xs">
							{option}
						</span>
					))}
				</div>
			);
		default:
			return <p className="text-sm text-muted-foreground">{answer}</p>;
	}
}
