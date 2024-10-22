import { z } from 'zod';

export const formSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	type: z.enum(['time_off', 'role_application', 'boarding']),
	levels: z
		.object({ type: z.string(), id: z.string(), level: z.number() })
		.refine(input => (input.type == 'employee' && input.id) || input.type == 'admin' || input.type == 'manager', { message: 'Selete an employee' })
		.array()
		.min(1, { message: 'Add at least one approval level' }),
	is_default: z.boolean().optional()
});

export interface LEVEL {
	type: string;
	id: string;
	level: number;
	isopen?: boolean;
}
