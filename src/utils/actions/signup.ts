'use server';

import { createClient } from '../supabase/server';

export const signup = async (event: FormData) => {
	const supabase = await createClient();

	const signupData = {
		email: event.get('email') as string,
		password: event.get('password') as string,
		first_name: event.get('first-name') as string,
		last_name: event.get('last-name') as string
	};

	const { data, error } = await supabase.auth.signUp(signupData);
	return { data, error };
};
