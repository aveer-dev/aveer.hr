import { z } from 'zod';

export type FORM_INPUT_TYPE = 'text' | 'number' | 'textarea' | 'multiselect' | 'select' | 'date' | 'file';

export const INPUT_TYPE_ZOD = z.enum(['text', 'number', 'textarea', 'multiselect', 'select', 'date', 'file']);
