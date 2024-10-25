import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

// export * from './cssVar';
// export * from './getConnectionText';
// export * from './getRenderContainer';
// export * from './isCustomNodeSelected';
// export * from './isTextSelected';
