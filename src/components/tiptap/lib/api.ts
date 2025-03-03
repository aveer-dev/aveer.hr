'use server';

import { createClient } from '@/utils/supabase/server';

const getImageLink = async (path: string) => {
	const supabase = await createClient();
	const { data } = supabase.storage.from('documents-assets').getPublicUrl(path);
	return data.publicUrl;
};

export const uploadImage = async (file: ArrayBuffer | File, path: string, bucket: string): Promise<string> => {
	const supabase = await createClient();

	const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: 'image/png' });

	if (error && (error as any)?.error == 'Duplicate') {
		const { data, error } = await supabase.storage.from(bucket).update(path, file, { contentType: 'image/png' });
		if (error) throw error.message;

		const imageLink = await getImageLink(data.path);
		return imageLink;
	}

	if (error) throw error.message;
	const imageLink = await getImageLink(data.path);
	return imageLink;
};

export default uploadImage;
