import { ChevronRight } from 'lucide-react';
import { Tables } from '@/type/database.types';
import { Separator } from '@/components/ui/separator';
import { BoardingReview } from './boarding/boarding-review';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBoardingRequests } from './contract-assignments/utils';

interface props {
	org: string;
	contract: Tables<'contracts'>;
	manager?: Tables<'managers'> | null;
}

export const BoardingsReview = async ({ org, contract, manager }: props) => {
	const boardingRequests = await getBoardingRequests({ contract: contract.id, manager, org });

	return (
		<section className="mt-20 w-full">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-support">On/Off boarding review</h2>
			</div>

			<div className="">
				<Separator className="mb-8 mt-2" />

				{typeof boardingRequests !== 'string' && boardingRequests && boardingRequests.length > 0 && (
					<ul className="space-y-10">
						{boardingRequests.map(
							boarding =>
								boarding && (
									<li key={boarding.id}>
										<BoardingReview data={boarding as any} contractId={contract.id} className="w-full text-left" reviewType={manager || boarding.contract.direct_report == contract.id ? 'manager' : 'employee'}>
											<Button variant={'outline'} className="flex h-fit w-full items-center justify-between px-3 py-4 text-left">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<h2 className="text-xs">
															{boarding?.contract?.profile?.first_name} {boarding?.contract?.profile?.last_name}
														</h2>

														<Badge className="h-5" variant={boarding.state == 'approved' ? 'secondary-success' : boarding.state == 'pending' ? 'secondary-warn' : 'outline'}>
															{boarding.state}
														</Badge>
													</div>

													<p className="text-xs text-muted-foreground">{boarding.contract.job_title}</p>
												</div>

												<ChevronRight size={12} />
											</Button>
										</BoardingReview>
									</li>
								)
						)}
					</ul>
				)}

				{typeof boardingRequests !== 'string' && boardingRequests.length == 0 && (
					<div className="flex min-h-40 items-center justify-center rounded-md bg-accent/50 text-xs text-muted-foreground">
						<p>You do not have any boardings to review</p>
					</div>
				)}
			</div>
		</section>
	);
};
