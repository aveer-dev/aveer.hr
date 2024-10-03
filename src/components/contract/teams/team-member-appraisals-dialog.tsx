import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tables } from '@/type/database.types';
import { FileCheck } from 'lucide-react';
import { Appraisals } from '../appraisal/appraisals';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface props {
	org: string;
	contract: Tables<'contracts'>;
	managerContract: number;
}

export const TeamMemberAppraisalsDialog = ({ org, contract, managerContract }: props) => {
	return (
		<Sheet>
			<SheetTrigger className="flex items-center" asChild>
				<Button variant={'outline'}>
					<FileCheck size={12} className="mr-2" /> Appraise
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{(contract.profile as any).first_name}&apos;s appraisals</SheetTitle>
					<SheetDescription>See appraisals and details below</SheetDescription>
				</SheetHeader>

				<Tabs defaultValue="employee" className="mt-10 w-full">
					<TabsList className="mb-8 grid w-fit grid-cols-2">
						<TabsTrigger value="employee">Employee</TabsTrigger>
						<TabsTrigger value="manager">Manager</TabsTrigger>
					</TabsList>

					<TabsContent value="employee">
						<Appraisals full={false} org={org} contract={contract.id} isOwner={false} group={'employee'} />
					</TabsContent>

					<TabsContent value="manager">
						<Appraisals managerContract={managerContract} full={false} org={org} contract={contract.id} isOwner={true} group={'manager'} />
					</TabsContent>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
};
