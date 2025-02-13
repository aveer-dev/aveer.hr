import { Tables } from '@/type/database.types';
import { Card } from '@caldwell619/react-kanban';

export type CustomCard = Tables<'job_applications'> & Card;
