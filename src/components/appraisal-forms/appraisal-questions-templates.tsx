'use server';

import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionTemplateDialog } from './question-template-dialog';
import { Tables } from '@/type/database.types';
import { EmployeeHoverCard } from '../ui/employee-hover-card';
interface AppraisalQuestionsListProps {
	org: string;
	teams: Tables<'teams'>[];
}

export const AppraisalQuestionsTemplates = async ({ org, teams }: AppraisalQuestionsListProps) => {
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
		<div className="space-y-8">
			{data.map(template => (
				<QuestionTemplateDialog key={template.id} teams={teams} org={org} template={template}>
					<Card className="w-full cursor-pointer">
						<CardHeader className="p-3 pb-2">
							<CardTitle className="text-sm font-normal">{template.name}</CardTitle>
							{template.description && <CardDescription className="text-xs">{template.description}</CardDescription>}
						</CardHeader>

						<CardContent className="p-3 pt-0">
							<div className="text-xs text-muted-foreground">
								Created by: <EmployeeHoverCard employeeId={template.created_by.id} org={org} triggerClassName="text-muted-foreground" contentClassName="text-xs" />
							</div>
						</CardContent>
					</Card>
				</QuestionTemplateDialog>
			))}
		</div>
	);
};
