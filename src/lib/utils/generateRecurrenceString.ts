export const frequency = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
export type Frequency = (typeof frequency)[number];

export const weekday = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
export type Weekday = (typeof weekday)[number];

interface RecurrenceOptions {
	frequency: Frequency;
	interval?: number; // How often the event repeats (e.g., every 2 weeks)
	count?: number; // Number of occurrences
	until?: Date; // End date
	weekdays?: Weekday[]; // Specific days of the week
	monthDay?: number | number[]; // Day(s) of the month (1-31 or array of days)
	position?: number; // Position of the weekday in month (e.g., -1 for last, 1 for first)
	bymonth?: number | number[]; // Month number (1-12)
}

export const generateRecurrence = (options: RecurrenceOptions): string => {
	const parts: string[] = [`RRULE:FREQ=${options.frequency}`];

	// Add interval if specified
	if (options.interval && options.interval > 1) {
		parts.push(`INTERVAL=${options.interval}`);
	}

	// Add count if specified
	if (options.count) {
		parts.push(`COUNT=${options.count}`);
	}

	// Add until date if specified
	if (options.until) {
		const untilStr = options.until
			.toISOString()
			.replace(/[-:]/g, '') // Remove dashes and colons
			.replace(/\.\d{3}/, '') // Remove milliseconds
			.replace(/Z$/, ''); // Remove timezone
		parts.push(`UNTIL=${untilStr}`);
	}

	// Add month(s) if specified
	if (options.bymonth) {
		if (Array.isArray(options.bymonth)) {
			parts.push(`BYMONTH=${options.bymonth.join(',')}`);
		} else {
			parts.push(`BYMONTH=${options.bymonth}`);
		}
	}

	// Add month day(s) if specified
	if (options.monthDay) {
		if (Array.isArray(options.monthDay)) {
			parts.push(`BYMONTHDAY=${options.monthDay.join(',')}`);
		} else {
			parts.push(`BYMONTHDAY=${options.monthDay}`);
		}
	}

	// Add weekdays if specified
	if (options.weekdays && options.weekdays.length > 0) {
		parts.push(`BYDAY=${options.weekdays.join(',')}`);
	}

	// Add position if specified (for monthly/yearly recurrences)
	if (options.position && options.weekdays) {
		const bysetpos = `BYSETPOS=${options.position}`;
		// Remove existing BYDAY and add it with position
		const index = parts.findIndex(part => part.startsWith('BYDAY'));
		if (index !== -1) {
			parts.splice(index, 1);
		}
		parts.push(bysetpos);
		parts.push(`BYDAY=${options.weekdays.join(',')}`);
	}

	return parts.join(';');
};
