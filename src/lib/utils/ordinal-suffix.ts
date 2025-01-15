export function addOrdinalSuffix(number: number) {
	// Handle negative numbers and non-integers
	if (!Number.isInteger(number) || number < 0) {
		throw new Error('Please provide a positive integer');
	}

	// Get last digit and last two digits
	const lastDigit = number % 10;
	const lastTwoDigits = number % 100;

	// Special case for 11, 12, 13
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return number + 'th';
	}

	// For all other numbers
	switch (lastDigit) {
		case 1:
			return number + 'st';
		case 2:
			return number + 'nd';
		case 3:
			return number + 'rd';
		default:
			return number + 'th';
	}
}
