import { LegalEntityForm } from './form';

export default function Home({ params }: { params: { [key: string]: string } }) {
	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-xl font-semibold">Create Legal Entity</h1>

			<LegalEntityForm org={params.org} />
		</div>
	);
}
