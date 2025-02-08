import { BackButton } from '@/components/ui/back-button';
import { LegalEntityForm } from './form';

export default async function Home(props: { params: Promise<{ [key: string]: string }> }) {
    const params = await props.params;
    return (
		<div className="mx-auto max-w-4xl">
			<div className="relative mb-6 flex">
				<BackButton className="absolute -left-16" />

				<h1 className="text-xl font-semibold">Create Legal Entity</h1>
			</div>

			<LegalEntityForm org={params.org} />
		</div>
	);
}
