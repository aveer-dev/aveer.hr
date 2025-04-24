import { Tables } from '@/type/database.types';

export interface GroupedQuestions {
	growth_and_development: Tables<'template_questions'>[];
	company_values: Tables<'template_questions'>[];
	competencies: Tables<'template_questions'>[];
	private_manager_assessment: Tables<'template_questions'>[];
	objectives: Tables<'template_questions'>[];
	goal_scoring: Tables<'template_questions'>[];
}

export type AnswersState = Record<number, any>;

export interface Answer {
	question_id: number;
	answer: any;
	[key: string]: any;
}

export interface Objective {
	id: string;
	title: string;
	description: string;
	goals: Goal[];
}

export interface Goal {
	id: string;
	title: string;
	description: string;
}

export interface GOAL_SCORE {
	goal_id: string;
	score?: number;
	comment?: string;
	filePath?: string;
	fileName?: string;
}
