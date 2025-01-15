import { Tables } from '@/type/database.types';

/**
 * Searches an array of Person objects for matches against a search query.
 *
 * @param teams The array of db team objects to search.
 * @param query The search query string.
 * @param keys Optional. An array of keys within the team object to search against.
 *              Defaults to searching against all keys if not provided.
 * @returns An array of team objects that match the search query.
 */

export const searchTeams = (teams: Tables<'teams'>[], query: string, keys?: (keyof Tables<'teams'>)[]): Tables<'teams'>[] => {
	if (!query) {
		return [];
	}

	const searchTerm = query.toLowerCase();

	return teams.filter(team => {
		if (!keys) {
			// Search all keys if keys array isn't provided
			return Object.values(team).some(value => String(value).toLowerCase().includes(searchTerm));
		} else {
			// Search specified keys only
			return keys.some(key => String(team[key]).toLowerCase().includes(searchTerm));
		}
	});
};
