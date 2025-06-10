'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/type/database.types';
import { BarChart, Bar, YAxis, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ChartContainer } from '@/components/ui/chart';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface Props {
	questions: Tables<'template_questions'>[];
	answers: Tables<'appraisal_answers'>[];
	employees: (Tables<'contracts'> & { profile: { first_name: string; last_name: string } })[];
	teamsForQuestions?: { id: number; name: string }[];
}

export const AppraisalQuestionsStats: React.FC<Props> = ({ questions, answers, employees, teamsForQuestions = [] }) => {
	const [openSheetId, setOpenSheetId] = useState<number | null>(null);

	// Group questions by their 'group' property
	const groupedQuestions: Record<string, typeof questions> = {};
	questions.forEach(q => {
		const groupName = q.group || 'Ungrouped';
		if (!groupedQuestions[groupName]) groupedQuestions[groupName] = [];
		groupedQuestions[groupName].push(q);
	});

	// Helper to get all answers for a question
	const getAnswersForQuestion = (questionId: number, type: 'self' | 'manager') => {
		return answers
			.map(a => {
				const arr = (type === 'self' ? a.answers : a.manager_answers) as any[];
				const found = arr?.find(ans => ans.question_id === questionId);
				return found ? { contract_id: a.contract_id, answer: found.answer } : null;
			})
			.filter(Boolean);
	};

	return (
		<div className="mt-8 space-y-24">
			{Object.entries(groupedQuestions).map(([groupName, groupQuestions]) => {
				// Format group name: replace underscores/dashes, capitalize words
				const formattedGroupName = groupName
					.replace(/[_-]+/g, ' ')
					.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
					.trim();
				return (
					<div key={groupName}>
						{/* Group name heading */}
						<h3 className="mb-4 text-sm font-normal text-muted-foreground">{formattedGroupName}</h3>
						{groupQuestions.map(q => {
							// For each question q, filter employees:
							const relevantEmployees = employees.filter(emp => {
								const teamMatch = !q.team_ids?.length || q.team_ids.includes((emp.team as any)?.id || emp.team);
								const empMatch = !q.employee_ids?.length || q.employee_ids.includes(emp.id);
								return teamMatch || empMatch;
							});

							// Get answer distributions for self and manager
							let chart: React.ReactNode = null;
							if (q.type === 'scale') {
								// Use scale_labels if present, otherwise fallback to 1-5
								const scaleLabels =
									Array.isArray(q.scale_labels) && q.scale_labels.length === 5
										? q.scale_labels.map((l: any, idx: number) => ({
												label: l?.label || (idx + 1).toString(),
												description: l?.description || ''
											}))
										: [1, 2, 3, 4, 5].map(val => ({ label: val.toString(), description: '' }));

								const selfCounts = scaleLabels.map((_, idx) => getAnswersForQuestion(q.id, 'self').filter(a => a && a.answer === idx + 1).length);
								const managerCounts = scaleLabels.map((_, idx) => getAnswersForQuestion(q.id, 'manager').filter(a => a && a.answer === idx + 1).length);
								const data = scaleLabels.map((l, idx) => ({
									label: l.label,
									description: l.description,
									Self: selfCounts[idx],
									Manager: managerCounts[idx]
								}));

								// Shadcn chart config for bar chart
								const chartConfig = {
									Self: {
										label: 'Self',
										color: '#a3a3a3'
									},
									Manager: {
										label: 'Manager',
										color: '#525252'
									}
								};

								chart = (
									<ChartContainer config={chartConfig} className="h-80 w-full">
										<BarChart barGap={4} data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }} width={400} height={220} accessibilityLayer>
											<YAxis dataKey="label" type="category" width={100} />
											<ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
											<Legend />
											<Bar dataKey="Self" fill={chartConfig.Self.color} radius={[0, 4, 4, 0]} barSize={18} minPointSize={6} />
											<Bar dataKey="Manager" fill={chartConfig.Manager.color} radius={[0, 4, 4, 0]} barSize={18} minPointSize={6} />
										</BarChart>
									</ChartContainer>
								);
							} else if (q.type === 'multiselect') {
								// Use options for Y-axis labels
								const options = Array.isArray(q.options) ? q.options : [];
								const optionLabels = options.map((opt: any, idx: number) => ({
									label: typeof opt === 'string' ? opt : opt?.label || `Option ${idx + 1}`
								}));

								// For each option, count how many times it was selected in self and manager answers
								const selfCounts = optionLabels.map(
									(opt, idx) =>
										getAnswersForQuestion(q.id, 'self').filter(a => {
											if (!a) return false;
											if (Array.isArray(a.answer)) {
												return a.answer.includes(idx);
											} else if (typeof a.answer === 'object' && a.answer !== null && Array.isArray(a.answer.options)) {
												return a.answer.options.includes(idx);
											}
											return false;
										}).length
								);
								const managerCounts = optionLabels.map(
									(opt, idx) =>
										getAnswersForQuestion(q.id, 'manager').filter(a => {
											if (!a) return false;
											if (Array.isArray(a.answer)) {
												return a.answer.includes(idx);
											} else if (typeof a.answer === 'object' && a.answer !== null && Array.isArray(a.answer.options)) {
												return a.answer.options.includes(idx);
											}
											return false;
										}).length
								);
								const data = optionLabels.map((l, idx) => ({
									label: l.label,
									Self: selfCounts[idx],
									Manager: managerCounts[idx]
								}));

								const chartConfig = {
									Self: {
										label: 'Self',
										color: '#a3a3a3'
									},
									Manager: {
										label: 'Manager',
										color: '#525252'
									}
								};

								chart = (
									<ChartContainer config={chartConfig} className="h-80 w-full">
										<BarChart barGap={4} data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }} width={400} height={220} accessibilityLayer>
											<YAxis dataKey="label" type="category" width={100} />
											<ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
											<Legend />
											<Bar dataKey="Self" fill={chartConfig.Self.color} radius={[0, 4, 4, 0]} barSize={18} minPointSize={6} />
											<Bar dataKey="Manager" fill={chartConfig.Manager.color} radius={[0, 4, 4, 0]} barSize={18} minPointSize={6} />
										</BarChart>
									</ChartContainer>
								);
							} else if (q.type === 'yesno') {
								// Pie charts for yes/no: one for self, one for manager
								const selfYes = getAnswersForQuestion(q.id, 'self').filter(a => a && a.answer === 'yes').length;
								const selfNo = getAnswersForQuestion(q.id, 'self').filter(a => a && a.answer === 'no').length;
								const managerYes = getAnswersForQuestion(q.id, 'manager').filter(a => a && a.answer === 'yes').length;
								const managerNo = getAnswersForQuestion(q.id, 'manager').filter(a => a && a.answer === 'no').length;
								const selfPieData = [
									{ name: 'Yes', value: selfYes },
									{ name: 'No', value: selfNo }
								];
								const managerPieData = [
									{ name: 'Yes', value: managerYes },
									{ name: 'No', value: managerNo }
								];
								// Shadcn chart config for pie chart
								const pieChartConfig = {
									Yes: {
										label: 'Yes',
										color: '#a3a3a3'
									},
									No: {
										label: 'No',
										color: '#525252'
									}
								};
								chart = (
									<div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-8 sm:flex-row">
										<ChartContainer config={pieChartConfig} className="h-full w-full" style={{ width: 180, height: 180 }}>
											<RePieChart width={140} height={140} accessibilityLayer>
												<Pie data={selfPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
													{selfPieData.map((entry, idx) => (
														<Cell key={`cell-self-${idx}`} fill={pieChartConfig[entry.name as 'Yes' | 'No'].color} />
													))}
												</Pie>
												<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
												<Legend />
											</RePieChart>
										</ChartContainer>
										<ChartContainer config={pieChartConfig} className="h-full w-full" style={{ width: 180, height: 180 }}>
											<RePieChart width={140} height={140} accessibilityLayer>
												<Pie data={managerPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
													{managerPieData.map((entry, idx) => (
														<Cell key={`cell-mgr-${idx}`} fill={pieChartConfig[entry.name as 'Yes' | 'No'].color} />
													))}
												</Pie>
												<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
												<Legend />
											</RePieChart>
										</ChartContainer>
									</div>
								);
							}

							return (
								<Card key={q.id} className="mb-4 divide-y">
									<CardHeader className="p-4">
										<CardTitle className="">
											<div className="space-y-3">
												<p className="text-sm">
													<span className="pr-2 font-normal text-muted-foreground">Self Review:</span>
													{q.question}
												</p>
												<p className="text-sm">
													<span className="pr-2 font-normal text-muted-foreground">Manager Review:</span>
													{q.manager_question}
												</p>
											</div>
										</CardTitle>
									</CardHeader>

									<div className="flex flex-wrap items-center gap-2 px-4 pt-4">
										<Badge variant="secondary" className="text-xs capitalize">
											{q.type == 'textarea' ? 'Text' : q.type == 'multiselect' ? 'Multi-select' : q.type == 'yesno' ? 'Yes/No' : q.type}
										</Badge>
										{/* Team badges if any */}
										{Array.isArray(q.team_ids) &&
											q.team_ids.length > 0 &&
											q.team_ids.map((tid: number) => {
												const team = teamsForQuestions.find(t => t.id === tid);
												return team ? (
													<Badge key={tid} variant="outline" className="text-xs">
														Team: {team.name}
													</Badge>
												) : null;
											})}
									</div>

									{chart && <div className="my-4">{chart}</div>}

									<CardContent className="pt-6">
										<Button size="sm" variant="outline" onClick={() => setOpenSheetId(q.id)}>
											View Answers
										</Button>

										<Sheet open={openSheetId === q.id} onOpenChange={open => setOpenSheetId(open ? q.id : null)}>
											<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-4xl">
												<SheetHeader>
													<SheetTitle className="mb-4">Answers for Question</SheetTitle>

													<div className="space-y-3">
														<p className="text-sm">
															<span className="pr-2 font-normal text-muted-foreground">Self Review:</span>
															{q.question}
														</p>
														<p className="text-sm">
															<span className="pr-2 font-normal text-muted-foreground">Manager Review:</span>
															{q.manager_question}
														</p>
													</div>
												</SheetHeader>

												<div className="mt-10 space-y-4">
													<ResizablePanelGroup direction="horizontal" className="max-h-[80vh] min-h-[200px] w-full overflow-auto">
														<ResizablePanel defaultSize={33} minSize={15} className="min-w-[120px]">
															<div className="border-b pb-2 pr-3 text-xs font-semibold text-muted-foreground">Employee</div>

															<ResizablePanelGroup direction="vertical" className="w-full">
																{relevantEmployees.map((emp, rowIdx) => (
																	<React.Fragment key={emp.id}>
																		<ResizablePanel defaultSize={100 / relevantEmployees.length} minSize={10} className="min-h-[32px]">
																			<div className="flex h-full items-center border-b py-2 pr-3 text-sm">
																				{emp.profile.first_name} {emp.profile.last_name}
																			</div>
																		</ResizablePanel>
																		{rowIdx < relevantEmployees.length - 1 && <ResizableHandle withHandle />}
																	</React.Fragment>
																))}
															</ResizablePanelGroup>
														</ResizablePanel>

														<ResizableHandle withHandle />

														<ResizablePanel defaultSize={33} minSize={15} className="min-w-[120px]">
															<div className="border-b px-3 pb-2 text-xs font-semibold text-muted-foreground">Self Answer</div>

															<ResizablePanelGroup direction="vertical" className="w-full">
																{relevantEmployees.map((emp, rowIdx) => {
																	const selfAns = getAnswersForQuestion(q.id, 'self').find(a => a && a.contract_id === emp.id);
																	return (
																		<React.Fragment key={emp.id}>
																			<ResizablePanel defaultSize={100 / relevantEmployees.length} minSize={10} className="min-h-[32px]">
																				<div className="flex h-full items-center border-b px-3 py-2 text-sm">{selfAns ? selfAns.answer?.toString() : <span className="italic text-muted-foreground">No answer</span>}</div>
																			</ResizablePanel>
																			{rowIdx < relevantEmployees.length - 1 && <ResizableHandle withHandle />}
																		</React.Fragment>
																	);
																})}
															</ResizablePanelGroup>
														</ResizablePanel>

														<ResizableHandle withHandle />

														<ResizablePanel defaultSize={34} minSize={15} className="min-w-[120px]">
															<div className="border-b px-3 pb-2 text-xs font-semibold text-muted-foreground">Manager Answer</div>

															<ResizablePanelGroup direction="vertical" className="w-full">
																{relevantEmployees.map((emp, rowIdx) => {
																	const mgrAns = getAnswersForQuestion(q.id, 'manager').find(a => a && a.contract_id === emp.id);
																	return (
																		<React.Fragment key={emp.id}>
																			<ResizablePanel defaultSize={100 / relevantEmployees.length} minSize={10} className="min-h-[32px]">
																				<div className="flex h-full items-center border-b px-3 py-2 text-sm">{mgrAns ? mgrAns.answer?.toString() : <span className="italic text-muted-foreground">No answer</span>}</div>
																			</ResizablePanel>
																			{rowIdx < relevantEmployees.length - 1 && <ResizableHandle withHandle />}
																		</React.Fragment>
																	);
																})}
															</ResizablePanelGroup>
														</ResizablePanel>
													</ResizablePanelGroup>
												</div>
											</SheetContent>
										</Sheet>
									</CardContent>
								</Card>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};
