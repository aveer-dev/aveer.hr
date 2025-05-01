'use server';

import { ProfileRepository } from '@/dal/repositories/profile.repository';

export async function getProfileById(id: string) {
	const profileRepository = new ProfileRepository();
	return profileRepository.getById(id);
}

export async function getProfileByEmail(email: string) {
	const profileRepository = new ProfileRepository();
	return profileRepository.getByEmail(email);
}

export async function getProfilesByOrg(org: string) {
	const profileRepository = new ProfileRepository();
	return profileRepository.getAllByOrg(org);
}
