interface ScoreScaleProps {
	value: number;
	height?: string;
	showLabel?: boolean;
}

export const ScoreScale = ({ value, height = 'h-2', showLabel = true }: ScoreScaleProps) => {
	// Ensure value is between 0 and 100
	const clampedValue = Math.min(Math.max(value, 0), 100);

	return (
		<div className="relative w-full">
			{/* Scale background with gradient */}
			<div
				className={`w-full rounded-full ${height}`}
				style={{
					background: 'linear-gradient(to right, #FF6B6B, #FF9F43, #FFD93D, #6BCB77)',
					boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
				}}
			/>

			{/* Marker */}
			<div
				className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center"
				style={{
					left: `${clampedValue}%`,
					transform: `translateX(-50%) translateY(-50%)`
				}}>
				<div className="h-4 w-1.5 rounded-full bg-white shadow-md" />
				{showLabel && <span className="mt-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium shadow-sm">{clampedValue.toFixed(1)}%</span>}
			</div>
		</div>
	);
};
