/**
 * Strips text of underscores/dashes, capitalize words
 * @param groupName string - Text to format
 * @returns string - Formatted string
 */
export const formatText = (groupName: string) =>
	groupName
		.replace(/[_-]+/g, ' ')
		.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.trim();
