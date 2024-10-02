import { z } from 'zod';

export type FORM_INPUT_TYPE = 'text' | 'number' | 'textarea' | 'multiselect' | 'select' | 'date';

export const INPUT_TYPE_ZOD = z.enum(['text', 'number', 'textarea', 'multiselect', 'select', 'date']);
