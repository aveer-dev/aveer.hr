interface TimezoneInfo {
	name: string;
	offset: string;
	identifier: string;
}

/**
 * Returns a list of all available timezones with their offsets
 * @returns Array of timezone information objects
 */
export const getAllTimezones = (): TimezoneInfo[] => {
	const timezones: TimezoneInfo[] = [];
	const now = new Date();

	// Get all timezone identifiers
	const tzNames = Intl.supportedValuesOf('timeZone');

	tzNames.forEach(zoneName => {
		try {
			const formatter = new Intl.DateTimeFormat('en-US', {
				timeZone: zoneName,
				timeZoneName: 'long'
			});

			// Get the formatted timezone name
			const timezoneName = formatter.formatToParts(now).find(part => part.type === 'timeZoneName')?.value || zoneName;

			// Get the offset
			const tzOffset =
				new Date()
					.toLocaleString('en-US', {
						timeZone: zoneName,
						timeZoneName: 'shortOffset'
					})
					.split(' ')
					.pop() || '';

			timezones.push({
				name: timezoneName,
				offset: tzOffset,
				identifier: zoneName
			});
		} catch (error) {
			console.warn(`Error processing timezone ${zoneName}:`, error);
		}
	});

	// Sort by offset
	return timezones.sort((a, b) => {
		const offsetA = parseInt(a.offset.replace(/[^-\d]/g, '')) || 0;
		const offsetB = parseInt(b.offset.replace(/[^-\d]/g, '')) || 0;
		return offsetA - offsetB;
	});
};

/**
 * Gets the user's current timezone
 * @returns The timezone identifier string
 */
export const getCurrentTimezone = (): string => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch (error) {
		console.warn('Error getting timezone:', error);
		return 'UTC';
	}
};

/**
 * Example usage:
 *
 * const allTimezones = getAllTimezones();
 * console.log('All timezones:', allTimezones);
 * // [
 * //   { name: "Pacific Standard Time", offset: "GMT-8", identifier: "America/Los_Angeles" },
 * //   ...
 * // ]
 *
 * const userTimezone = getCurrentTimezone();
 * console.log('Current timezone:', userTimezone);
 * // "America/New_York"
 */
