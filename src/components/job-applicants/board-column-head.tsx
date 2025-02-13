import { Card, Column } from '@caldwell619/react-kanban';

export const BoardHead = (column: Column<Card>) => {
	return (
		<div className="mb-4">
			<h2 className="text-sm font-semibold capitalize">{column.title}</h2>
		</div>
	);
};
