'use client';

import { useEffect, useState } from 'react';

export const InLineChart = () => {
	const [data, setData] = useState(0);

	// useEffect(() => {
	// 	setInterval(() => {
	// 		setData(metric);
	// 	}, 1000);
	// }, [metric]);

	return (
		<div className="">
			{/* <h3 className="mb-8 text-base font-normal text-support">Tasks by state</h3> */}
			<div className="relative h-2 w-full rounded-md bg-accent">
				<div className="group absolute bottom-0 top-0 z-40 rounded-md bg-red-400 transition-all duration-500 hover:-bottom-0.5 hover:-top-0.5" style={{ width: 10 + '%', left: '0%' }}>
					{10 > 0 && <div className="pointer-events-none absolute -right-px bottom-2 h-2 border-r pr-2 text-xs text-muted-foreground opacity-0 transition-all duration-500 group-hover:h-10 group-hover:opacity-100">{10}</div>}
				</div>

				<div className="group absolute bottom-0 left-0 top-0 z-30 rounded-md bg-green-400 transition-all duration-500 hover:-bottom-0.5 hover:-top-0.5" style={{ width: 60 + '%', left: 10 + '%' }}>
					{60 > 0 && <div className="pointer-events-none absolute -right-px bottom-2 h-2 border-r pr-2 text-xs text-muted-foreground opacity-0 transition-all duration-500 group-hover:h-10 group-hover:opacity-100">{60}</div>}
				</div>

				<div className="group absolute bottom-0 left-0 top-0 z-20 rounded-md bg-yellow-400 transition-all duration-500 hover:-bottom-0.5 hover:-top-0.5" style={{ width: 10 + '%', left: 10 + 60 + '%' }}>
					{10 > 0 && <div className="pointer-events-none absolute -right-px bottom-2 h-2 border-r pr-2 text-xs text-muted-foreground opacity-0 transition-all duration-500 group-hover:h-10 group-hover:opacity-100">{10}</div>}
				</div>

				<div className="group absolute bottom-0 left-0 top-0 z-10 rounded-md bg-gray-400 transition-all duration-500 hover:-bottom-0.5 hover:-top-0.5" style={{ width: 10 + '%', left: 10 + 60 + 10 + '%' }}>
					{10 > 0 && <div className="pointer-events-none absolute -right-px bottom-2 h-2 border-r pr-2 text-xs text-muted-foreground opacity-0 transition-all duration-500 group-hover:h-10 group-hover:opacity-100">{10}</div>}
				</div>

				<div className="group absolute bottom-0 left-0 top-0 z-0 rounded-md bg-blue-400 transition-all duration-500 hover:-bottom-0.5 hover:-top-0.5" style={{ width: 10 + '%', left: 10 + 60 + 10 + 10 + '%' }}>
					{10 > 0 && <div className="pointer-events-none absolute -right-px bottom-2 h-2 border-r pr-2 text-xs text-muted-foreground opacity-0 transition-all duration-500 group-hover:h-10 group-hover:opacity-100">{10}</div>}
				</div>
			</div>

			<div className="mt-2 flex items-center gap-6">
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-red-400"></div>
					<div>Cancelled</div>
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-green-400"></div>
					<div>Done</div>
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-yellow-400"></div>
					<div>In progress</div>
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-gray-400"></div>
					<div>Todo</div>
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-blue-400"></div>
					<div>Backlog</div>
				</div>
			</div>
		</div>
	);
};
