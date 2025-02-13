import { ApplicantDetails } from '@/components/open-role/roles/applicant-details';
import { CustomCard } from './types';
import { APPLICANT } from '@/type/roles.types';

export const BoardCard = (card: CustomCard, _options: any, onUpdateApplicant: (data: APPLICANT, oldStage?: string) => void) => {
	return (
		<div className="mb-7 w-full min-w-72 rounded-md border border-border/70 bg-muted/80">
			<div className="space-y-4 px-3 pb-5 pt-3">
				<h3 className="text-sm font-medium">
					{card.first_name} {card.last_name}
				</h3>

				<ul className="space-y-2 text-xs text-muted-foreground">
					<li>{card.email}</li>
					<li>{card.phone_number}</li>
				</ul>
			</div>

			<div className="flex items-center justify-between border-t p-3 pt-5">
				<p className="text-sm">{(card.role as any).job_title}</p>

				<ApplicantDetails data={card as any} userRole="admin" onUpdate={onUpdateApplicant} />
			</div>
		</div>
	);
};
