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
