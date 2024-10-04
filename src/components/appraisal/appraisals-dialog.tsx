import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tables } from '@/type/database.types';
import { FileCheck } from 'lucide-react';
import { Appraisals } from './appraisals';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROLE } from '@/type/contract.types';
import { ReactNode } from 'react';
import { VariantProps } from 'class-variance-authority';

interface props {
	org: string;
	contract: Tables<'contracts'>;
	managerContract?: number;
	role: ROLE;
	adminId?: string;
	className?: string;
	children?: ReactNode;
	variant?: VariantProps<typeof buttonVariants>;
}

export const AppraisalsDialog = ({ className, variant, children, adminId, org, contract, managerContract, role }: props) => {
	return (
		<Sheet>
			<SheetTrigger className="flex items-center" asChild>
				<Button variant={'secondary'} className={className} {...variant}>
					{children || (
						<>
							<FileCheck size={12} className="mr-2" /> Appraisal
						</>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className="overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{(contract.profile as any).first_name}&apos;s appraisals</SheetTitle>
					<SheetDescription>See appraisals and details below</SheetDescription>
				</SheetHeader>

				<Tabs defaultValue="employee" className="mt-10 w-full">
					<TabsList className="mb-8 flex w-fit">
						{role !== 'employee' && <TabsTrigger value="employee">Employee</TabsTrigger>}
						<TabsTrigger value="manager">Manager</TabsTrigger>
						<TabsTrigger value="result">Result</TabsTrigger>
					</TabsList>

					{role !== 'employee' && (
						<TabsContent value="employee">
							<Appraisals formType="employee" role={role} full={false} org={org} contract={contract} group={'employee'} />
						</TabsContent>
					)}

					<TabsContent value="manager">
						<Appraisals formType="manager" role={role} managerContract={managerContract} full={false} org={org} contract={contract} group={'manager'} />
					</TabsContent>

					<TabsContent value="result">
						<Appraisals formType="admin" adminId={adminId} full={false} role={role} org={org} contract={contract} />
					</TabsContent>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
};
