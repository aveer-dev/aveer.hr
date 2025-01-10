import { cn } from '@/lib/utils';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const MentionList = forwardRef((props: any, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const selectItem = (index: number) => {
		const item = props.items[index];

		if (item) return props.command(item);
	};

	const upHandler = () => {
		setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	useEffect(() => setSelectedIndex(0), [props.items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }: any) => {
			if (event.key === 'ArrowUp') {
				upHandler();
				return true;
			}

			if (event.key === 'ArrowDown') {
				downHandler();
				return true;
			}

			if (event.key === 'Enter') {
				enterHandler();
				return true;
			}

			return false;
		}
	}));

	return (
		<div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
			{props.items.length ? (
				props.items.map((item: any, index: number) => (
					<button
						className={cn(
							'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs font-light outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&.is-selected]:bg-accent hover:[&.is-selected]:bg-accent',
							index === selectedIndex ? 'is-selected' : ''
						)}
						key={index}
						onClick={() => selectItem(index)}>
						{item.label}
					</button>
				))
			) : (
				<div className="item">No result</div>
			)}
		</div>
	);
});

MentionList.displayName = 'MentionList';

export default MentionList;
