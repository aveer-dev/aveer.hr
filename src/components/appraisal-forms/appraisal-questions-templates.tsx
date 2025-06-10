'use server';

import { createClient } from '@/utils/supabase/server';
import { QuestionTemplateDialog } from './question-template-dialog';
import { Tables } from '@/type/database.types';
import { EmployeeHoverCard } from '../ui/employee-hover-card';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Fragment } from 'react';
import { ContractWithProfile } from '@/dal/interfaces/contract.repository.interface';

interface AppraisalQuestionsListProps {
	org: string;
	teams: Tables<'teams'>[];
	employees: ContractWithProfile[];
}

export const AppraisalQuestionsTemplates = async ({ org, teams, employees }: AppraisalQuestionsListProps) => {
	const supabase = await createClient();
	const { data, error } = await supabase.from('question_templates').select('*, created_by(id, first_name, last_name)').match({ org });

	if (error) {
		return (
			<div className="flex h-56 flex-col items-center justify-center gap-2 rounded-md bg-accent text-xs text-muted-foreground">
				<p>Error loading questions</p>
				<p>{error.message}</p>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="flex h-56 flex-col items-center justify-center gap-2 rounded-md bg-accent text-xs text-muted-foreground">
				<p>There are no question templates for this organisation</p>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{data.map(template => (
				<Fragment key={template.id}>
					<QuestionTemplateDialog teams={teams} employees={employees} org={org} template={template}>
						<Button className="h-[unset] w-full justify-between gap-2 p-4 text-left" variant="ghost">
							<h4 className="text-sm font-normal">{template.name}</h4>

							<div className="flex justify-between gap-4">
								<div className="text-xs text-muted-foreground">
									Created by: <EmployeeHoverCard employeeId={template.created_by.id} org={org} triggerClassName="text-muted-foreground" contentClassName="text-xs" />
								</div>
								<Separator orientation="vertical" />
								<div className="text-xs text-muted-foreground">Last updated: {format(template.updated_at || new Date(), 'MMM d, yyyy')}</div>
							</div>
						</Button>
					</QuestionTemplateDialog>

					<Separator />
				</Fragment>
			))}
		</div>
	);
};
