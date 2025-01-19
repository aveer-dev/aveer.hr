import { Tables } from '@/type/database.types';

interface Profile {
	first_name: string;
	last_name: string;
	id: string;
}

interface Person {
	id: number;
	profile: Profile;
}

/**
 * Searches an array of Person objects for matches against a search query.
 *
 * @param people The array of Person objects to search.
 * @param query The search query string.
 * @param keys Optional. An array of keys within the profile object to search against.
 *              Defaults to searching against all keys if not provided.
 * @returns An array of Person objects that match the search query.
 */
export const searchPeople = (people: Person[], query: string, keys?: (keyof Profile)[], allowEmpty: boolean = false): Person[] => {
	if (!query) return allowEmpty ? [] : people;

	const searchTerm = query.toLowerCase();

	return people.filter(person => {
		const profile: Tables<'profiles'> = person.profile as any;

		if (!keys) {
			// Search all keys if keys array isn't provided
			return Object.values(profile).some(value => String(value).toLowerCase().includes(searchTerm));
		} else {
			// Search specified keys only
			return keys.some(key => String(profile[key]).toLowerCase().includes(searchTerm));
		}
	});
};
