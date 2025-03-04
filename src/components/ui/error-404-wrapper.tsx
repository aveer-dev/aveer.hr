'use client';

import { Cursor } from '@/components/ui/cursor';
import { CircleSlash } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useRef, ReactNode } from 'react';

export const Error404Wrapper = ({ children, cursorText }: { children: ReactNode; cursorText: string }) => {
	const [isHovering, setIsHovering] = useState(false);
	const targetRef = useRef<HTMLDivElement>(null);

	const handlePositionChange = (x: number, y: number) => {
		if (targetRef.current) {
			const rect = targetRef.current.getBoundingClientRect();
			const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
			setIsHovering(isInside);
		}
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 top-0 z-20 flex flex-col justify-center bg-white/20 backdrop-blur-md">
			<Cursor
				attachToParent
				variants={{
					initial: { scale: 0.3, opacity: 0 },
					animate: { scale: 1, opacity: 1 },
					exit: { scale: 0.3, opacity: 0 }
				}}
				springConfig={{
					bounce: 0.001
				}}
				transition={{
					ease: 'easeInOut',
					duration: 0.15
				}}
				onPositionChange={handlePositionChange}>
				<motion.div
					animate={{
						width: isHovering ? 80 : 16,
						height: isHovering ? 32 : 16
					}}
					className="flex items-center justify-center rounded-[24px] bg-gray-500/40 backdrop-blur-md dark:bg-gray-300/40">
					<AnimatePresence>
						{isHovering ? (
							<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="inline-flex w-full items-center justify-center">
								<div className="inline-flex items-center text-sm text-white dark:text-black">
									{cursorText}
									<CircleSlash className="ml-1 h-4 w-4" />
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>
				</motion.div>
			</Cursor>

			<div ref={targetRef}>{children}</div>
		</div>
	);
};
