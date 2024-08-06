import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';

export default function Home() {
	return (
		<form className="mx-auto grid w-full max-w-4xl gap-6">
			<h1 className="text-xl font-semibold">Add Person</h1>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Personal details</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid grid-cols-2 gap-6">
						<div className="grid w-full gap-3">
							<Label htmlFor="first-name">First name</Label>
							<Input id="first-name" type="text" placeholder="Enter first name" required />
						</div>

						<div className="grid w-full gap-3">
							<Label htmlFor="last-name">Last name</Label>
							<Input id="last-name" type="text" placeholder="Enter last name" required />
						</div>
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="Enter email" required />
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div className="grid w-full gap-3">
							<Label htmlFor="nationalty">Employee nationalty</Label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select employee's nationality" />
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
							<Label htmlFor="nationalty">Employment country</Label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select employment country" />
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
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Employment details</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid grid-cols-2 gap-6">
						<div className="grid w-full gap-3">
							<Label htmlFor="nationalty">Job title</Label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select job title" />
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
							<Label htmlFor="nationalty">Level</Label>
							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select seniority level" />
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
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="nationalty">Employment type</Label>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Is employee full-time or part-time?" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="full-time">Full-time</SelectItem>
									<SelectItem value="part-time">Part-time</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="grid w-full gap-3">
						<Label>Work schedule</Label>
						<div className="grid w-full grid-cols-2 gap-6">
							<div className="relative h-fit w-full">
								<Input id="email" type="email" placeholder="40" required />
								<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">hours</div>
							</div>

							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Daily, weekly or monthly" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="weekly">Weekly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
										<SelectItem value="daily">Daily</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid w-full gap-6">
						<Label htmlFor="email">Job responsibilities</Label>
						<ul className="ml-4 grid gap-2">
							<li className="list-disc text-xs text-foreground">One on one</li>
							<li className="list-disc text-xs text-foreground">One on one</li>
						</ul>

						<div className="grid w-full gap-2">
							<Textarea placeholder="Type job description here" />
							<p className="text-xs font-thin text-muted-foreground">Type and add job descriptions one after the other</p>
							<Button type="button">Add a job description</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Compensation</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid w-full gap-3">
						<Label htmlFor="compesation">Salary</Label>
						<Input id="compesation" type="text" placeholder="Employee gross annual salary" required />
					</div>

					<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="signin-bonus">Add signing bonus</Label>
							<Switch id="signin-bonus" className="scale-75" />
						</div>

						<Input id="compesation" type="text" placeholder="Enter employee's signing bonus" required />
					</div>

					<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="signin-bonus">Fixed allowances</Label>
							<Switch id="signin-bonus" className="scale-75" />
						</div>

						<div className="grid grid-cols-2 gap-6">
							<Input id="compesation" type="text" placeholder="Enter employee's signing bonus" required />

							<Select>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select payment schedule" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="one-off">One off</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<Button type="button">Add allowance</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 border-t border-t-border pt-10">
				<div>
					<h2 className="font-semibold">Job Schedule</h2>
					<p className="mt-3 max-w-72 text-xs font-thin text-muted-foreground">This should be the public name of your entire organisation. This is mostly an organisation identifier.</p>
				</div>

				<div className="mb-10 grid gap-8">
					<div className="grid w-full gap-3">
						<Label htmlFor="compesation">Employment start date</Label>
						<DatePicker />
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div className="grid w-full gap-3">
							<Label htmlFor="compesation">Paid time off</Label>
							<div className="relative h-fit w-full">
								<Input id="email" type="email" placeholder="20" required />
								<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/month</div>
							</div>
						</div>

						<div className="grid w-full gap-3">
							<Label htmlFor="compesation">Sick leave</Label>
							<div className="relative h-fit w-full">
								<Input id="email" type="email" placeholder="20" required />
								<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days/month</div>
							</div>
						</div>
					</div>

					<div className="grid gap-3">
						<Label htmlFor="signin-bonus">Employment term</Label>
						<div className="grid w-full gap-3 rounded-lg bg-accent px-2 py-2">
							<div className="flex items-center justify-between space-x-2">
								<Label htmlFor="signin-bonus">Indefinite</Label>
								<Switch id="signin-bonus" className="scale-75" />
							</div>

							<DatePicker />
						</div>
					</div>

					<div className="grid w-full gap-3">
						<Label htmlFor="compesation">Probation period</Label>
						<div className="relative h-fit w-full">
							<Input id="email" type="email" placeholder="90" required />
							<div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-thin text-foreground">days</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end border-t border-t-border pt-10">
				<div className={cn(buttonVariants(), 'p-0')}>
					<DropdownMenu>
						<Button size={'sm'}>Create Person</Button>

						<DropdownMenuTrigger asChild>
							<Button size={'icon'} className="h-full !outline-none !ring-0 !ring-offset-0">
								<ChevronDown size={16} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuGroup>
								<DropdownMenuItem className="p-0">
									<Button size={'sm'} variant={'ghost'} className="">
										Create person and rest form
									</Button>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</form>
	);
}
