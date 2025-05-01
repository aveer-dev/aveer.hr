/**
 * Generates a consistent HSLA color based on a string input.
 * Useful for generating unique colors for users in collaborative features.
 *
 * @param input String to generate color from (e.g., user ID)
 * @returns HSLA color string
 */
export function generateHslaColors(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = input.charCodeAt(i) + ((hash << 5) - hash);
	}

	const h = hash % 360;
	return `hsla(${h}, 70%, 50%, 1.0)`;
}
