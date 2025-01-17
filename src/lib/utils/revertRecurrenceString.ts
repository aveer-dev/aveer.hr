type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

interface RecurrenceOptions {
	frequency: Frequency;
	interval?: number;
	count?: number;
	until?: Date;
	weekdays?: Weekday[];
	monthDay?: number | number[];
	position?: number;
	bymonth?: number | number[];
}

export function parseRecurrence(rrule: string): RecurrenceOptions {
	// Remove 'RRULE:' prefix if present
	const cleanRule = rrule.replace(/^RRULE:/, '');

	// Split into parts and create initial result object
	const parts = cleanRule.split(';');
	const result: RecurrenceOptions = {
		frequency: 'DAILY' // Default value, will be overwritten
	};

	// Process each part
	parts.forEach(part => {
		const [key, value] = part.split('=');

		switch (key) {
			case 'FREQ':
				result.frequency = value as Frequency;
				break;

			case 'INTERVAL':
				result.interval = parseInt(value);
				break;

			case 'COUNT':
				result.count = parseInt(value);
				break;

			case 'UNTIL':
				// Parse UNTIL date format: YYYYMMDDTHHMMSS or YYYYMMDD
				const year = parseInt(value.slice(0, 4));
				const month = parseInt(value.slice(4, 6)) - 1; // Months are 0-based
				const day = parseInt(value.slice(6, 8));

				if (value.includes('T')) {
					const hour = parseInt(value.slice(9, 11));
					const minute = parseInt(value.slice(11, 13));
					const second = parseInt(value.slice(13, 15));
					result.until = new Date(year, month, day, hour, minute, second);
				} else {
					result.until = new Date(year, month, day);
				}
				break;

			case 'BYDAY':
				const days = value.split(',');
				if (days.length > 0) {
					// Check if any day has a position prefix
					const hasPosition = days.some(day => /^[+-]?\d/.test(day));

					if (hasPosition) {
						// Extract position from the first day with a position
						const dayWithPosition = days.find(day => /^[+-]?\d/.test(day))!;
						const position = parseInt(dayWithPosition.match(/^[+-]?\d+/)![0]);
						result.position = position;

						// Clean up weekdays by removing positions
						result.weekdays = days.map(day => day.replace(/^[+-]?\d+/, '')) as Weekday[];
					} else {
						result.weekdays = days as Weekday[];
					}
				}
				break;

			case 'BYMONTHDAY':
				const monthDays = value.split(',').map(v => parseInt(v));
				result.monthDay = monthDays.length === 1 ? monthDays[0] : monthDays;
				break;

			case 'BYSETPOS':
				result.position = parseInt(value);
				break;

			case 'BYMONTH':
				const months = value.split(',').map(v => parseInt(v));
				result.bymonth = months.length === 1 ? months[0] : months;
				break;
		}
	});

	return result;
}
