import { z } from 'zod';

export type FORM_INPUT_TYPE = 'text' | 'number' | 'textarea' | 'multiselect' | 'select' | 'date';

export const INPUT_TYPE_ZOD = z.enum(['text', 'number', 'textarea', 'multiselect', 'select', 'date']);

export const q = z
	.object({
		question: z.string().min(2, { message: 'Question is required' }),
		options: z.string().min(2).array().optional(),
		type: INPUT_TYPE_ZOD,
		isTypeOpen: z.boolean().optional(),
		isTeamOpen: z.boolean().optional(),
		required: z.boolean().optional(),
		id: z.number(),
		isDeleting: z.boolean().optional(),
		isArchived: z.boolean().optional(),
		order: z.number(),
		created_at: z.string().optional(),
		team: z.string().optional()
	})
	.refine(
		question => {
			if (question.type !== 'select' && question.type !== 'multiselect') return true;
			return question.options && question.options.length > 0;
		},
		{ message: 'Provide at least one option' }
	);
