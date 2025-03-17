'use client';

import { KanbanBoard, ControlledBoard, Column } from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import './style.css';
import { BoardCard } from './board-card';
import { BoardHead } from './board-column-head';
import { CustomCard } from './types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateApplicant, updateApplication } from '@/components/open-role/roles/application.action';
import { toast } from 'sonner';
import { APPLICANT } from '@/type/roles.types';
import { cn } from '@/lib/utils';

export const ApplicantsBoard = ({ stages, initialBoards, className }: { stages: string[]; initialBoards: KanbanBoard<CustomCard>; className?: string }) => {
	const router = useRouter();
	const [board, updateBoard] = useState(initialBoards);

	const onCardDragEnd = async (card: CustomCard, source: { fromPosition: number; fromColumnId: string }, destination: { toPosition: number; toColumnId: string }) => {
		const newBoard = moveCard({ card: { ...card, stage: destination.toColumnId }, source, destination });

		const response = await updateApplicant({ applicant: card as any, stage: destination.toColumnId });

		if (typeof response == 'string') return toast('😭 Error', { description: response });

		const cardColumnInNewBoard = newBoard?.columns.findIndex(column => column.id == destination.toColumnId);
		if (cardColumnInNewBoard == undefined || cardColumnInNewBoard < 0) return;

		const newBoardcardIndex = newBoard?.columns[cardColumnInNewBoard].cards.findIndex(newBoardcard => newBoardcard.id == card.id);
		if (newBoardcardIndex == undefined || newBoardcardIndex < 0) return;

		newBoard!.columns[cardColumnInNewBoard].cards[newBoardcardIndex] = response;

		updateBoard(newBoard!);

		router.refresh();
	};

	const onUpdateApplicant = (data: APPLICANT, oldStage?: string) => {
		if (!oldStage) return;

		const fromColumn = board.columns.find(column => column.id == oldStage);
		const cardIndex = fromColumn?.cards.findIndex(card => card.id == data.id);
		if (cardIndex == undefined || cardIndex < 0) return;

		moveCard({ card: data, source: { fromColumnId: oldStage, fromPosition: cardIndex }, destination: { toColumnId: data.stage, toPosition: 0 } });
		router.refresh();
	};

	const moveCard = ({ card, source, destination }: { card: CustomCard; source: { fromPosition: number; fromColumnId: string }; destination: { toPosition: number; toColumnId: string } }) => {
		const columnMap = new Map<string, { column: Column<CustomCard>; index: number }>();
		board.columns.forEach((column, index) => columnMap.set(column.id as string, { column, index }));

		const fromColumnData = columnMap.get(source.fromColumnId);
		const toColumnData = columnMap.get(destination.toColumnId);

		if (!fromColumnData || !toColumnData) return;

		const fromColumn = fromColumnData.column;
		const toColumn = toColumnData.column;
		const fromIndex = fromColumnData.index;
		const toIndex = toColumnData.index;

		fromColumn.cards.splice(source.fromPosition, 1); // Remove 1 element at the fromPosition
		toColumn.cards.splice(destination.toPosition, 0, card); // Insert card at toPosition

		const newBoardColumns = [...board.columns]; // Create a shallow copy to trigger React update if board.columns is itself a const
		newBoardColumns[fromIndex] = fromColumn;
		newBoardColumns[toIndex] = toColumn;

		const newBoard = { ...board, columns: newBoardColumns };
		updateBoard(newBoard);

		return newBoard;
	};

	const moveAllCards = async (fromColumnId: string, toColumnId: string) => {
		const columnMap = new Map<string, { column: Column<CustomCard>; index: number }>();
		board.columns.forEach((column, index) => columnMap.set(column.id as string, { column, index }));

		const fromColumnData = columnMap.get(fromColumnId);
		const toColumnData = columnMap.get(toColumnId);

		if (!fromColumnData || !toColumnData) return;

		const fromColumn = fromColumnData.column;
		const toColumn = toColumnData.column;
		const toIndex = toColumnData.index;

		// Move all cards
		const movedCards = fromColumn.cards.map(card => ({ ...card, stage: toColumnId }));
		toColumn.cards = [...toColumn.cards, ...movedCards];

		// Clear the source column
		fromColumn.cards = [];

		// Update the board state
		const newBoardColumns = [...board.columns];
		newBoardColumns[fromColumnData.index] = fromColumn;
		newBoardColumns[toIndex] = toColumn;

		toColumn.cards.map(card =>
			toast.promise(updateApplication(card.id, { id: card.id, stage: card.stage }, (card.org as any)?.subdomain || card.org), {
				loading: `Moving applicant, ${card.first_name}...`,
				success: res => {
					if (typeof res === 'string') return res;
					return `Applicant, ${card.first_name}, has been moved to ${toColumnId}`;
				},
				error: 'Error'
			})
		);

		const newBoard = { ...board, columns: newBoardColumns };
		updateBoard(newBoard);

		router.refresh();
	};

	return (
		<div className={cn(className)}>
			<ControlledBoard
				allowAddCard={false}
				renderCard={(card, options) => BoardCard!(card as CustomCard, options, onUpdateApplicant)}
				renderColumnHeader={(column: Column<CustomCard>) => <BoardHead stages={stages} column={column} moveCards={moveAllCards} />}
				disableColumnDrag
				onCardDragEnd={onCardDragEnd as any}>
				{board}
			</ControlledBoard>
		</div>
	);
};
