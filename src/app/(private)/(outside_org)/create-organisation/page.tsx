import { CreateOrgForm } from './form';

export default function Home() {
	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-xl font-semibold">Organisation Setup</h1>

			<CreateOrgForm />
		</div>
	);
}
