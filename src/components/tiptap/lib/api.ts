'use server';

import { createClient } from '@/utils/supabase/server';

export const uploadImage = async (file: ArrayBuffer | File, path: string, bucket: string) => {
	const supabase = await createClient();
	const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: 'image/png' });

	if (error && (error as any)?.error == 'Duplicate') {
		const { data, error } = await supabase.storage.from(bucket).update(path, file, { contentType: 'image/png' });
		if (error) throw error.message;
		return data.path;
	}

	if (error) throw error.message;
	return data.path;
};

export default uploadImage;
