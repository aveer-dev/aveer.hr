export interface UPDATE {
	title: string;
	date: string;
	author: {
		name: string;
		link: string;
		title?: string;
	};
	tag?: string[];
	slug: string;
}
