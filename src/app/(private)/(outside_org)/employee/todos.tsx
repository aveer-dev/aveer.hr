import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export const Todos = async () => {
	return (
		<section>
			<h2 className="mb-4 ml-2 text-sm font-normal text-support">Todos</h2>

			<div className="flex overflow-hidden rounded-3xl bg-muted/60 p-4">
				<ul className="h-full max-h-72 w-full max-w-[16rem] space-y-1 overflow-y-auto rounded-2xl bg-background px-8 py-4 text-sm drop-shadow-sm">
					<li className="flex justify-between rounded-md bg-gradient-to-tr p-2 px-3 py-3 transition-all duration-500 hover:from-foreground/10 hover:to-foreground/0">
						Profile <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">3</span>
					</li>
					<li className="flex justify-between rounded-md bg-gradient-to-tr p-2 px-3 py-3 transition-all duration-500 hover:from-foreground/10 hover:to-foreground/0">
						Contracts <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">6</span>
					</li>
					<li className="flex justify-between rounded-md bg-gradient-to-tr p-2 px-3 py-3 transition-all duration-500 hover:from-foreground/10 hover:to-foreground/0">
						Appraisals <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">1</span>
					</li>
					<li className="flex justify-between rounded-md bg-gradient-to-tr p-2 px-3 py-3 transition-all duration-500 hover:from-foreground/10 hover:to-foreground/0">
						Teams <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">9</span>
					</li>
					<li className="flex justify-between rounded-md bg-gradient-to-tr p-2 px-3 py-3 transition-all duration-500 hover:from-foreground/10 hover:to-foreground/0">
						Time-off <span className="w-6 rounded-md bg-muted p-1 text-center text-xs">13</span>
					</li>
				</ul>

				<div className="max-h-72 w-full overflow-auto py-4">
					<div className="mx-auto max-w-96">
						<h3 className="mb-2 text-base font-semibold">Summary</h3>

						<ul className="space-y-4">
							<li className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
								<div className="flex gap-3">
									<Checkbox /> Profile
								</div>
								<ChevronRight size={12} />
							</li>
							<li className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
								<div className="flex gap-3">
									<Checkbox />
									Contracts
								</div>
								<ChevronRight size={12} />
							</li>
							<li className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
								<div className="flex gap-3">
									<Checkbox />
									Appraisals
								</div>
								<ChevronRight size={12} />
							</li>
							<li className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
								<div className="flex gap-3">
									<Checkbox />
									Teams
								</div>
								<ChevronRight size={12} />
							</li>
							<li className="flex w-full items-center justify-between rounded-lg bg-background p-4 text-sm">
								<div className="flex gap-3">
									<Checkbox />
									Time-off
								</div>
								<ChevronRight size={12} />
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};
