import { Circle, CircleDotDashed, Maximize, Square, SquareCheckBig, SquareMinus } from 'lucide-react';

export const IssueStateIcon = ({ state, size }: { state: string; size?: number }) => {
	return (
		<>
			{state === 'Backlog' && <Maximize size={size || 16} />}
			{state === 'Todo' && <Square size={size || 14} />}
			{state === 'In Progress' && <CircleDotDashed className="text-yellow-600" size={size || 16} />}
			{state === 'Done' && <SquareCheckBig className="text-green-600" size={size || 16} />}
			{state === 'Cancelled' && <SquareMinus className="text-red-600" size={size || 16} />}
			{state !== 'Cancelled' && state !== 'Done' && state !== 'Backlog' && state !== 'Todo' && state !== 'In Progress' && <Circle size={size || 16} />}
		</>
	);
};
