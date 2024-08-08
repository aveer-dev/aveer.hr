import { CreateOrgForm } from './form';

export default function Home() {
	return (
		<>
			<div className="mx-auto max-w-4xl">
				<h1 className="text-xl font-semibold">Organisation Setup</h1>

				<CreateOrgForm />
			</div>
		</>
	);
}
