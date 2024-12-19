import { PLANE_CYCLE } from './plane.types';

/**
 * Searches an array of Cyle objects for matches against a search query.
 *
 * @param cycles The array of Cycle objects to search.
 * @param query The search query string.
 * @param keys Optional. An array of keys within the cyles object to search against.
 *              Defaults to searching against all keys if not provided.
 * @returns An array of Cyle objects that match the search query.
 */
export const searchCycle = (cycles: PLANE_CYCLE[], query: string, keys?: (keyof PLANE_CYCLE)[]): PLANE_CYCLE[] => {
	if (!query) {
		return cycles;
	}

	const searchTerm = query.toLowerCase();

	return cycles.filter(cycle => {
		if (!keys) {
			// Search all keys if keys array isn't provided
			return Object.values(cycle).some(value => String(value).toLowerCase().includes(searchTerm));
		} else {
			// Search specified keys only
			return keys.some(key => String(cycle[key]).toLowerCase().includes(searchTerm));
		}
	});
};
