import { format } from 'date-fns';

interface RecurrenceRule {
	FREQ?: 'SECONDLY' | 'MINUTELY' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
	INTERVAL?: string;
	WKST?: 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';
	BYDAY?: string;
	BYMONTHDAY?: string;
	BYMONTH?: string;
	BYHOUR?: string;
	BYMINUTE?: string;
	BYSECOND?: string;
	BYWEEKNO?: string;
	BYYEARDAY?: string;
	COUNT?: string;
	UNTIL?: string;
	BYSETPOS?: string;
}

type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

interface DayMappings {
	[key: string]: string;
}

interface MonthMappings {
	[key: string]: string;
}

interface PositionMappings {
	[key: string]: string;
}

export const parseRecurrenceRule = (rrule: string): string => {
	if (!rrule.startsWith('RRULE:')) {
		rrule = 'RRULE:' + rrule;
	}

	const parts: string[] = rrule.replace('RRULE:', '').split(';');
	const rules: RecurrenceRule = {};

	parts.forEach(part => {
		const [key, value] = part.split('=');
		rules[key as keyof RecurrenceRule] = value as any;
	});

	const description: string[] = [];

	// Enhanced frequency mapping
	const freqMap: { [key: string]: string } = {
		DAILY: 'day',
		WEEKLY: 'week',
		MONTHLY: 'month',
		YEARLY: 'year',
		HOURLY: 'hour',
		MINUTELY: 'minute',
		SECONDLY: 'second'
	};

	// Handle interval
	const interval: number = rules.INTERVAL ? parseInt(rules.INTERVAL) : 1;
	const freq: string = rules.FREQ ? freqMap[rules.FREQ] || rules.FREQ.toLowerCase() : '';

	if (interval === 1) {
		description.push(`Every ${freq}`);
	} else {
		description.push(`Every ${interval} ${freq}s`);
	}

	// Handle week start
	if (rules.WKST && rules.WKST !== 'MO') {
		const dayMap: DayMappings = {
			MO: 'Monday',
			TU: 'Tuesday',
			WE: 'Wednesday',
			TH: 'Thursday',
			FR: 'Friday',
			SA: 'Saturday',
			SU: 'Sunday'
		};
		description.push(`(weeks starting on ${dayMap[rules.WKST]})`);
	}

	// Handle specific days of the week
	// Handle specific days of the week with BYSETPOS
	if (rules.BYDAY) {
		const dayMap: DayMappings = {
			MO: 'Monday',
			TU: 'Tuesday',
			WE: 'Wednesday',
			TH: 'Thursday',
			FR: 'Friday',
			SA: 'Saturday',
			SU: 'Sunday'
		};

		const days: string[] = rules.BYDAY.split(',');
		if (days.length > 0) {
			let mappedDays: string[] = days.map(day => {
				// First check if there's a BYSETPOS
				if (rules.BYSETPOS) {
					const positions: PositionMappings = {
						'-1': 'last',
						'1': 'first',
						'2': 'second',
						'3': 'third',
						'4': 'fourth',
						'5': 'fifth',
						'-2': 'second-to-last',
						'-3': 'third-to-last',
						'-4': 'fourth-to-last',
						'-5': 'fifth-to-last'
					};
					return `${positions[rules.BYSETPOS] || `${rules.BYSETPOS}th`} ${dayMap[day as DayOfWeek]}`;
				}

				// If no BYSETPOS, check for numeric prefix in BYDAY
				const nth: RegExpMatchArray | null = day.match(/(-?\d+)([A-Z]{2})/);
				if (nth) {
					const num: string = nth[1];
					const weekday: string = dayMap[nth[2] as DayOfWeek] || nth[2];
					const positions: PositionMappings = {
						'-1': 'last',
						'1': 'first',
						'2': 'second',
						'3': 'third',
						'4': 'fourth',
						'5': 'fifth',
						'-2': 'second-to-last',
						'-3': 'third-to-last',
						'-4': 'fourth-to-last',
						'-5': 'fifth-to-last'
					};
					return `${positions[num] || `${num}th`} ${weekday}`;
				}
				return dayMap[day as DayOfWeek] || day;
			});

			if (rules.FREQ === 'WEEKLY') {
				description.push(`on ${formatList(mappedDays)}`);
			} else {
				description.push(`on the ${formatList(mappedDays)}`);
			}
		}
	}

	// Handle specific days of month
	if (rules.BYMONTHDAY) {
		const days: string[] = rules.BYMONTHDAY.split(',');
		const formattedDays: string[] = days.map(day => {
			const num: number = parseInt(day);
			if (num < 0) {
				if (num === -1) return 'last day';
				return `${Math.abs(num)}th-to-last day`;
			}
			return `${day}${getOrdinalSuffix(day)}`;
		});
		description.push(`on the ${formatList(formattedDays)}`);
	}

	// Handle specific months
	if (rules.BYMONTH) {
		const monthMap: MonthMappings = {
			'1': 'January',
			'2': 'February',
			'3': 'March',
			'4': 'April',
			'5': 'May',
			'6': 'June',
			'7': 'July',
			'8': 'August',
			'9': 'September',
			'10': 'October',
			'11': 'November',
			'12': 'December'
		};
		const months: string[] = rules.BYMONTH.split(',').map(m => monthMap[m] || m);
		description.push(`in ${formatList(months)}`);
	}

	// Handle specific hours
	if (rules.BYHOUR) {
		const hours: string[] = rules.BYHOUR.split(',').map(h => {
			const hour: number = parseInt(h);
			if (hour === 0) return '12 AM';
			if (hour === 12) return '12 PM';
			return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
		});
		description.push(`at ${formatList(hours)}`);
	}

	// Handle specific minutes
	if (rules.BYMINUTE) {
		const minutes: string[] = rules.BYMINUTE.split(',').map(m => `${m.padStart(2, '0')} minute${m === '1' ? '' : 's'}`);
		description.push(`at ${formatList(minutes)}`);
	}

	// Handle specific seconds
	if (rules.BYSECOND) {
		const seconds: string[] = rules.BYSECOND.split(',').map(s => `${s.padStart(2, '0')} second${s === '1' ? '' : 's'}`);
		description.push(`and ${formatList(seconds)}`);
	}

	// Handle specific weeks of the year
	if (rules.BYWEEKNO) {
		const weeks: string[] = rules.BYWEEKNO.split(',').map(week => {
			const num: number = parseInt(week);
			if (num < 0) {
				return `${Math.abs(num)}th-to-last week`;
			}
			return `week ${week}`;
		});
		description.push(`during ${formatList(weeks)}`);
	}

	// Handle specific days of the year
	if (rules.BYYEARDAY) {
		const days: string[] = rules.BYYEARDAY.split(',').map(day => {
			const num: number = parseInt(day);
			if (num < 0) {
				return `${Math.abs(num)}th-to-last day of the year`;
			}
			return `${day}${getOrdinalSuffix(day)} day of the year`;
		});
		description.push(`on the ${formatList(days)}`);
	}

	// Handle count
	if (rules.COUNT) {
		description.push(`for ${rules.COUNT} time${rules.COUNT === '1' ? '' : 's'}`);
	}

	// Handle until with timezone support
	if (rules.UNTIL) {
		const until: RegExpMatchArray | null = rules.UNTIL.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?(Z)?/);
		if (until) {
			let dateStr: string;
			if (until[4]) {
				// If time is included
				const date: Date = new Date(Date.UTC(parseInt(until[1]), parseInt(until[2]) - 1, parseInt(until[3]), parseInt(until[4]), parseInt(until[5]), parseInt(until[6])));
				dateStr = date.toLocaleString();
			} else {
				const date: Date = new Date(Number(until[1]), parseInt(until[2]) - 1, Number(until[3]));
				dateStr = date.toLocaleDateString();
			}
			description.push(`until ${format(dateStr, 'PP')}`);
		}
	}

	return description.join(' ');
};

function formatList(items: string[]): string {
	if (items.length === 0) return '';
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function getOrdinalSuffix(num: string | number): string {
	const number: number = typeof num === 'string' ? parseInt(num) : num;
	const j: number = number % 10;
	const k: number = number % 100;
	if (j === 1 && k !== 11) return 'st';
	if (j === 2 && k !== 12) return 'nd';
	if (j === 3 && k !== 13) return 'rd';
	return 'th';
}
