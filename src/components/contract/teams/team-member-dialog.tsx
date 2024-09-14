import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { Tables } from '@/type/database.types';

interface props {
	person: Tables<'contracts'> & { profile: Tables<'profiles'>; level: Tables<'employee_levels'> };
}

export const TeamMember = ({ person }: props) => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<button className="flex w-full items-center justify-between border-t bg-card py-8 text-left text-card-foreground outline-none transition-all duration-500 focus-visible:bg-accent/60">
					<div className="ml-2">
						<h2 className="text-xs">
							{person.profile?.first_name} {person.profile?.last_name}
							{(person.level || person.level_name) && (
								<Badge className="ml-2 py-px text-[10px]" variant={'secondary'}>
									{person.level?.level || person.level_name}
								</Badge>
							)}
						</h2>
						<p className="text-xs text-muted-foreground">{person.job_title}</p>
					</div>

					<ChevronRight className="mr-2" size={12} />
				</button>
			</SheetTrigger>

			<SheetContent>
				<SheetHeader>
					<SheetTitle>Team member</SheetTitle>
					<SheetDescription>Selected team member details</SheetDescription>
				</SheetHeader>

				<ul className="mt-10 grid gap-x-5 gap-y-6 py-4 text-sm font-light">
					<h3 className="text-sm">Personal Details</h3>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">First name</h4> <p className="font-normal">{person.profile?.first_name}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Last name</h4> <p className="font-normal">{person.profile?.last_name}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Gender</h4> <p className="font-normal capitalize">{person.profile?.gender || '-'}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Email</h4> <p className="font-normal">{person.profile?.email}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Country of origin</h4> <p className="font-normal">{(person.profile?.nationality as any)?.name || '-'}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Mobile number</h4> <p className="font-normal">{person.profile?.mobile ? `+${person.profile?.mobile}` : '-'}</p>
					</li>
				</ul>

				<ul className="mt-10 grid gap-x-5 gap-y-6 py-4 text-sm font-light">
					<h3 className="text-sm">Work Details</h3>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Job title</h4> <p className="font-normal">{person?.job_title}</p>
					</li>
					<li className="grid gap-1">
						<h4 className="text-xs text-muted-foreground">Level</h4> <p className="font-normal">{person.level?.level || person.level_name}</p>
					</li>
				</ul>
			</SheetContent>
		</Sheet>
	);
};
