import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
	return (
		<form className="grid gap-6 w-full mx-auto max-w-4xl">
			{/* organisation details */}
			<h1 className="text-xl font-semibold">Organisation Setup</h1>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Organisation details</h2>
					<p className="text-xs text-muted-foreground max-w-72 mt-3 font-thin">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="grid gap-8 mb-10">
					<div className="grid gap-3 w-full">
						<Label htmlFor="org-name">Organisation name</Label>
						<Input id="org-name" type="text" placeholder="aveer HQ" required />
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="org-name">Organisation website</Label>
						<Input id="org-name" type="text" placeholder="aveer HQ" required />
					</div>
				</div>
			</div>

			{/* legal entity details */}

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="mb-1 font-normal">Legal Entity</h2>
					<p className="text-xs text-muted-foreground max-w-72 mt-3 font-thin">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="grid gap-8 mb-10">
					<div className="grid gap-3 w-full">
						<Label htmlFor="legal-name">Legal entity name</Label>
						<Input id="legal-name" type="text" placeholder="Organisation legal name" required />
					</div>

					<div className="grid gap-3 w-full">
						<Label>Formation date</Label>
						<DatePicker />
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="country-of-inc">Country of incorporation</Label>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select country of incorporation" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="apple">Apple</SelectItem>
									<SelectItem value="banana">Banana</SelectItem>
									<SelectItem value="blueberry">Blueberry</SelectItem>
									<SelectItem value="grapes">Grapes</SelectItem>
									<SelectItem value="pineapple">Pineapple</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="entity-type">Entity type</Label>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select entity type" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="apple">Limited Liability Company</SelectItem>
									<SelectItem value="apple">Limited Liability Partnership</SelectItem>
									<SelectItem value="banana">B Corp</SelectItem>
									<SelectItem value="blueberry">C Corp</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					{/* legal entity details */}
					<div className="grid grid-cols-2 gap-6">
						<div className="grid gap-3 w-full">
							<Label htmlFor="ein">EIN</Label>
							<Input id="ein" type="text" placeholder="Enter employer identification number" required />
						</div>

						<div className="grid gap-3 w-full">
							<Label htmlFor="ein">SIC number</Label>
							<Input id="ein" type="text" placeholder="Enter SIC number" required />
						</div>
					</div>
				</div>
			</div>

			{/* contact details */}
			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="mb-1 font-normal">Organisation contact details</h2>
					<p className="text-xs text-muted-foreground max-w-72 mt-3 font-thin">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="grid gap-10 grid-cols-2">
					<div className="grid gap-3 w-full">
						<Label htmlFor="org-state">State</Label>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select organisation US state" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="apple">Apple</SelectItem>
									<SelectItem value="banana">Banana</SelectItem>
									<SelectItem value="blueberry">Blueberry</SelectItem>
									<SelectItem value="grapes">Grapes</SelectItem>
									<SelectItem value="pineapple">Pineapple</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="org-city">City</Label>
						<Input id="org-city" type="text" placeholder="Enter organisation address city" required />
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="org-street">Street address</Label>
						<Input id="org-street" type="text" placeholder="Enter organisation street address" required />
					</div>

					<div className="grid gap-3 w-full">
						<Label htmlFor="org-post">Post code</Label>
						<Input id="org-post" type="text" placeholder="Enter organisation address post code" required />
					</div>
				</div>
			</div>

			<div className="flex justify-end mt-16">
				<Button size={'sm'}>Setup Organisation</Button>
			</div>
		</form>
	);
}
