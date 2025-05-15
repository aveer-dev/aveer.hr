import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';
import { Info } from 'lucide-react';

export function ScaleIndicator({ value, max = 5, scaleLabels }: { value: number; max?: number; scaleLabels?: { label?: string; description?: string }[] }) {
	return (
		<div className="flex items-center gap-1">
			<div className="flex w-full gap-6">
				{Array.from({ length: max }).map((_, i) => {
					const labelObj = scaleLabels?.[i];
					const label = labelObj && typeof labelObj.label === 'string' ? labelObj.label : i + 1;
					const description = labelObj && typeof labelObj.description === 'string' ? labelObj.description : undefined;
					return description ? (
						<div className="flex flex-col items-center justify-center gap-2">
							<Button variant={i + 1 == value ? 'secondary_success' : 'outline'} className="disabled:opacity-100" disabled size="icon">
								{i + 1}
							</Button>

							<div className="flex items-center gap-2">
								<div className="text-xs text-muted-foreground">{label}</div>

								<TooltipProvider key={value}>
									<Tooltip>
										<TooltipTrigger>
											<Info size={12} className="text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<div className="max-w-64 text-xs">{description}</div>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					) : (
						<Button key={i} variant={i + 1 == value ? 'secondary_success' : 'outline'} className="disabled:opacity-100" disabled size="icon">
							{label}
						</Button>
					);
				})}
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
			return <ScaleIndicator value={answer as number} scaleLabels={Array.isArray(question.scale_labels) ? question.scale_labels : undefined} />;
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
