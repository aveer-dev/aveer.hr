import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { AppraisalCycleDialog } from './appraisal-cycle-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';

interface Props {
	org: string;
}

export const AppraisalCyclesList = async ({ org }: Props) => {
	const supabase = await createClient();
	const { data: cycles, error } = await supabase.from('appraisal_cycles').select('*, created_by(first_name, last_name)').match({ org }).order('start_date', { ascending: false });

	if (error) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>Error loading appraisal cycles</p>
			</div>
		);
	}

	if (!cycles || cycles.length === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-md bg-accent text-xs text-muted-foreground">
				<p>No appraisal cycles yet. Create one to get started.</p>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{/* Active Appraisals Section */}
			{cycles.some(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date()) && (
				<div className="space-y-4">
					{cycles
						.filter(cycle => new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date())
						.map(cycle => {
							const isActive = new Date(cycle.start_date) <= new Date() && new Date(cycle.end_date) >= new Date();

							return (
								<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle}>
									<Card className="w-full cursor-pointer">
										<CardHeader className="p-4">
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<CardTitle className="text-base font-medium">{cycle.name}</CardTitle>
													<CardDescription className="text-xs">
														{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
													</CardDescription>
												</div>
												<div className="flex items-center gap-2">{isActive && <Badge variant="outline">Active</Badge>}</div>
											</div>
										</CardHeader>

										<CardContent className="p-4 pt-0">
											<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
												<span>
													Created by: {cycle.created_by.first_name} {cycle.created_by.last_name}
												</span>

												<Link href={`/${org}/performance/${cycle.id}`}>
													<Button variant="secondary" className="border">
														Review Appraisal
													</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								</AppraisalCycleDialog>
							);
						})}
				</div>
			)}

			{/* Past Appraisals Section */}
			{cycles.some(cycle => new Date(cycle.end_date) < new Date()) && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h3 className="w-fit text-sm font-medium text-muted-foreground">Past Appraisals</h3>
						<Separator className="w-full max-w-3xl" />
					</div>

					{cycles
						.filter(cycle => new Date(cycle.end_date) < new Date())
						.map(cycle => {
							const isPast = new Date(cycle.end_date) < new Date();

							return (
								<AppraisalCycleDialog key={cycle.id} org={org} cycle={cycle}>
									<Card className="w-full cursor-pointer">
										<CardHeader className="p-4">
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<CardTitle className="text-base font-medium">{cycle.name}</CardTitle>
													<CardDescription className="text-xs">
														{format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
													</CardDescription>
												</div>
												<div className="flex items-center gap-2">{isPast && <Badge variant="secondary">Past</Badge>}</div>
											</div>
										</CardHeader>

										<CardContent className="p-4 pt-0">
											<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
												<span>
													Created by: {cycle.created_by.first_name} {cycle.created_by.last_name}
												</span>

												<Link href={`/${org}/performance/${cycle.id}`}>
													<Button variant="secondary" className="border">
														Review Appraisal
													</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								</AppraisalCycleDialog>
							);
						})}
				</div>
			)}
		</div>
	);
};
