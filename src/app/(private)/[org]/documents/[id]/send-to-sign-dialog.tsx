import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tables } from '@/type/database.types';
import { Share2 } from 'lucide-react';

export const SendToSignatories = ({ signatories, employees }: { signatories: { id: string; contract?: number; toc: string; receiver?: boolean }[]; employees: Tables<'contracts'>[] }) => {
	const getEmployeeName = (employeeId?: number) => {
		const profile = employees?.find(employee => employee.id == employeeId)?.profile;
		return `${(profile as any).first_name} ${(profile as any).last_name}`;
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost">
					<Share2 size={12} />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Send signature request</AlertDialogTitle>
					<AlertDialogDescription>Send signature request to selected document signatories</AlertDialogDescription>
				</AlertDialogHeader>

				<section>
					<ul>
						{signatories?.map(
							(signatory, index) =>
								!signatory.receiver && (
									<li key={index}>
										<Badge>{getEmployeeName(signatory.contract)}</Badge>
									</li>
								)
						)}
					</ul>
				</section>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
