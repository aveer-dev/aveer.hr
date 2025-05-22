import { differenceInSeconds } from 'date-fns';

export const currencyFormat = ({ currency, value }: { currency?: string; value: number }) => {
	return new Intl.NumberFormat(
		'en-US',
		currency
			? {
					style: 'currency',
					currency
				}
			: {}
	).format(Number(value));
};

export function randomElement<T>(array: Array<T>): T {
	return array[Math.floor(Math.random() * array.length)];
}

export const getTimeDifference = (date: Date) => {
	const now = new Date();

	const diff = differenceInSeconds(now, date);

	let differenceSecs = diff;
	if (differenceSecs < 0) differenceSecs = differenceInSeconds(date, now);

	const secondsDifference = differenceSecs;
	if (secondsDifference < 60) {
		return `${secondsDifference}s ${diff < 0 ? 'to go' : 'ago'}`;
	}

	const minutesDifference = Math.floor(secondsDifference / 60);
	if (minutesDifference < 60) {
		return `${minutesDifference}m  ${diff < 0 ? 'to go' : 'ago'}`;
	}

	const hoursDifference = Math.floor(minutesDifference / 60);
	if (hoursDifference < 24) {
		return `${hoursDifference}h  ${diff < 0 ? 'to go' : 'ago'}`;
	}

	const daysDifference = Math.floor(hoursDifference / 24);
	if (daysDifference >= 2) return `${daysDifference}d  ${diff < 0 ? 'to go' : 'ago'}`;
	return `${daysDifference}d, ${Math.floor(hoursDifference % 24)}h  ${diff < 0 ? 'to go' : 'ago'}`;
};

export const getTime = (dateString?: string) => {
	const date = dateString ? new Date(dateString) : new Date();
	const hour = date.getHours();
	const minute = date.getMinutes();

	return `${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`;
};

// Helper to check if a string is a UUID (v4)
export const isUUID = (str: string | null | undefined): boolean => {
	return !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export { addOrdinalSuffix } from './ordinal-suffix';
export { generateRecurrence, weekday, frequency, type Frequency, type Weekday } from './generateRecurrenceString';
export { parseRecurrenceRule } from './parseRecurrenceString';
export { searchTeams } from './team-search';
export { getAllTimezones, getCurrentTimezone } from './timezone';
export * from './colors';

// Re-export any other existing utility functions
export { parseRecurrence } from './revertRecurrenceString';
export * from './calculate-appraisal-score';
export * from './cn';
