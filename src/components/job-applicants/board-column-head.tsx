import { Column } from '@caldwell619/react-kanban';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { CustomCard } from './types';
import { ComposeMailDialog } from '../ui/mail-dialog';
import { toast } from 'sonner';
import { useState } from 'react';

export const BoardHead = ({ column, stages, moveCards }: { moveCards: (fromColumnId: string, toColumnId: string) => Promise<void>; stages: string[]; column: Column<CustomCard> }) => {
	const [showEmailDialog, toggleEmailDialog] = useState(false);

	return (
		<div className="mb-2 mt-0.5 flex items-center justify-between">
			<h2 className="text-sm font-semibold capitalize">{column.title}</h2>

			<DropdownMenu>
				<DropdownMenuTrigger disabled={!column.cards.length} asChild>
					<Button size={'icon'} variant="ghost" className="">
						<EllipsisVertical size={14} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-56" align="end">
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>Move all to...</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									{stages.map(
										stage =>
											stage !== column.title && (
												<DropdownMenuItem onSelect={moveCards.bind(this, column.title, stage)} className="capitalize" key={stage}>
													{stage}
												</DropdownMenuItem>
											)
									)}
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>

						{column.cards.length && (
							<ComposeMailDialog
								isOpen={showEmailDialog}
								toggleDialog={toggleEmailDialog}
								recipients={column.cards.map(card => card.email)}
								name={`Update from ${(column.cards[0].org as any).name}`}
								onClose={state => {
									if (state == 'success') toast.success('Application update sent');
								}}
								message={`Hey ${column.cards[0].first_name},

...continue message here

All the best.
HR at ${(column.cards[0].org as any).name}`}>
								<DropdownMenuItem onSelect={event => event.preventDefault()}>Send email</DropdownMenuItem>
							</ComposeMailDialog>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
