import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
	return (
		<form className="mx-auto grid w-full max-w-4xl gap-6">
			{/* organisation details */}
			<h1 className="text-xl font-semibold">Organisation Setup</h1>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Organisation details</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid w-full gap-3">
						<Label htmlFor="org-name">Organisation name</Label>
						<Input id="org-name" type="text" placeholder="aveer HQ" required />
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="org-name">Organisation website</Label>
						<Input id="org-name" type="text" placeholder="aveer HQ" required />
					</div>
				</div>
			</div>

			{/* legal entity details */}

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="mb-1 font-normal">Legal Entity</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid w-full gap-3">
						<Label htmlFor="legal-name">Legal entity name</Label>
						<Input id="legal-name" type="text" placeholder="Organisation legal name" required />
					</div>

					<div className="grid w-full gap-3">
						<Label>Formation date</Label>
						{/* <DatePicker /> */}
					</div>

					<div className="grid w-full gap-3">
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

					<div className="grid w-full gap-3">
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
						<div className="grid w-full gap-3">
							<Label htmlFor="ein">EIN</Label>
							<Input id="ein" type="text" placeholder="Enter employer identification number" required />
						</div>

						<div className="grid w-full gap-3">
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
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="grid grid-cols-2 gap-10">
					<div className="grid w-full gap-3">
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

					<div className="grid w-full gap-3">
						<Label htmlFor="org-city">City</Label>
						<Input id="org-city" type="text" placeholder="Enter organisation address city" required />
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="org-street">Street address</Label>
						<Input id="org-street" type="text" placeholder="Enter organisation street address" required />
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="org-post">Post code</Label>
						<Input id="org-post" type="text" placeholder="Enter organisation address post code" required />
					</div>
				</div>
			</div>

			<div className="mt-16 flex justify-end">
				<Button size={'sm'}>Setup Organisation</Button>
			</div>
		</form>
	);
}
