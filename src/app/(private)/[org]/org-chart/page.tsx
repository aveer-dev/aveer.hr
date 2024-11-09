import { createClient } from '@/utils/supabase/server';
import FlowDiagram from './flow-diagram';
import { Edge, Node, Position } from '@xyflow/react';
import { Tables } from '@/type/database.types';

export default async function OrgChartPage({ params: { org } }: { params: { org: string } }) {
	const supabase = createClient();

	const [{ data: teams, error: teamsError }, { data: people, error: peopleError }, { data: managers, error: managersError }] = await Promise.all([
		await supabase.from('teams').select().match({ org }),
		await supabase.from('contracts').select('*, profile:profiles!contracts_profile_fkey(first_name, last_name), direct_report(job_title, id, profile(first_name, last_name))').match({ org }),
		await supabase.from('managers').select('*, team:teams!managers_team_fkey(id, name), profile:profiles!managers_profile_fkey(first_name, last_name), person(id, team(name, id), job_title, direct_report(job_title, id, profile(first_name, last_name)))').match({ org })
	]);

	if (teamsError || peopleError || managersError) {
		return (
			<div className="flex min-h-80 w-full flex-col items-center justify-center space-y-3 rounded-md bg-muted text-xs text-support">
				<p className="">Something went wrong loading data.</p>

				<div className="space-x-1">
					{teamsError?.message && <p>Teams: {teamsError?.message}</p>}
					{peopleError?.message && <p>People: {peopleError?.message}</p>}
					{managersError?.message && <p>Managers: {managersError?.message}</p>}
				</div>
			</div>
		);
	}

	const employees = people?.filter(person => !managers!.find(manager => manager.person === person.id));

	const reportTos: { id: number; nodeId: string }[] = [];
	people
		?.filter(person => !!person.direct_report)
		.map(person => (person.direct_report as any).id)
		.forEach((reportTo: number) => (reportTos.find(rt => rt.id === reportTo) ? null : reportTos.push({ id: reportTo, nodeId: '' })));

	const teamless = people?.filter(person => person.direct_report && !managers!.find(manager => manager.person === person.id) && !person.team);

	const nodes: Node[] = [];
	const edges: Edge[] = [];

	let managersIndex: number = -1;

	for (const team of teams!) {
		const teamMembers = employees!.filter(person => person.team === team.id);
		const teamManagers = managers!.filter(manager => manager.team.id === team.id);

		teamManagers.forEach(manager => {
			managersIndex = managersIndex + 1;
			const x = 200 + managersIndex * 300;

			const multipleTimesManager = managers?.filter(mn => (mn.person as any).id === (manager.person as any).id)?.map(mn => ({ id: mn.id, name: (mn.team as any).name }));

			// creates manager node, also representing teams
			if (multipleTimesManager!.findIndex(mn => mn.id === manager.id) === 0) {
				nodes.push({
					id: `MG${manager.id}`,
					position: { x, y: 100 },
					data: {
						label: `${manager.profile?.first_name} ${manager.profile?.last_name}`,
						title: `${(manager.person as any).job_title}`,
						manager: multipleTimesManager.length > 1 ? multipleTimesManager.map(mn => mn.name) : [team.name]
					},
					width: 240,
					type: 'custom'
				});
			}

			const reportsTo: Tables<'contracts'> | null = (manager.person as unknown as Tables<'contracts'>)?.direct_report as any;

			if (reportsTo) {
				const isExistingManager = managers!.find(m => (m.person as any).id === reportsTo.id);
				const activeReportToIndex = reportTos.findIndex(rt => rt.id === reportsTo.id);

				if (reportTos[activeReportToIndex].nodeId == '') {
					// Only create a new node if the person the manager reports to is not a manager
					if (!isExistingManager) {
						nodes.push({
							id: `DR${reportsTo.id}`,
							targetPosition: Position.Right,
							position: { x, y: 0 },
							data: {
								label: `${(reportsTo.profile as any)?.first_name} ${(reportsTo.profile as any)?.last_name}`,
								title: `${reportsTo.job_title}`
							},
							type: 'custom',
							width: 240
						});
					}

					reportTos[activeReportToIndex].nodeId = !!isExistingManager ? `MG${isExistingManager.id}` : `DR${reportsTo.id}`;
				}

				edges.push({
					id: `MG-DR-e-${reportsTo.id}-${manager.id}`,
					source: reportTos[activeReportToIndex].nodeId,
					target: `MG${manager.id}`,
					animated: true,
					type: 'smoothstep'
				});
			}

			teamMembers.forEach((member, idx) => {
				if (member.id !== (manager.person as any).id) {
					if (teamManagers!.findIndex(mn => mn.id === manager.id) === 0) {
						nodes.push({
							id: `EE${member.id}`,
							position: { x, y: 400 + ((idx + 1) * 20 + idx * 50) },
							data: {
								label: `${member.profile?.first_name} ${member.profile?.last_name}`,
								title: `${member.job_title}`
							},
							width: 200,
							type: 'custom'
						});
					}

					if (teamManagers!.findIndex(mn => mn.id === manager.id) === 0) {
						edges.push({
							id: `EE-e-${member.id}-${manager.id}`,
							source: multipleTimesManager.length > 1 ? `MG${multipleTimesManager[0].id}` : `MG${manager.id}`,
							target: `EE${member.id}`,
							animated: true,
							type: 'smoothstep'
						});
					} else {
						edges.push({
							id: `EE-e-${member.id}-${manager.id}`,
							source: multipleTimesManager.length > 1 ? `MG${multipleTimesManager[0].id}` : `MG${teamManagers[0].id}`,
							target: `EE${member.id}`,
							animated: true,
							type: 'smoothstep'
						});
					}
				}

				// a team member might have someone they report to, other than the team manager
				const reportsTo: Tables<'contracts'> | null = member?.direct_report as any;

				if (reportsTo) {
					if (reportsTo.id === (manager.person as any).id) return;

					const isExistingManager = managers!.find(m => (m.person as any).id === reportsTo.id);
					const activeReportToIndex = reportTos.findIndex(rt => rt.id === reportsTo.id);

					if (reportTos[activeReportToIndex].nodeId == '') {
						// Only create a new node if the person the manager reports to is not a manager
						if (!isExistingManager) {
							nodes.push({
								id: `DR${reportsTo.id}`,
								targetPosition: Position.Right,
								position: { x, y: 0 },
								data: {
									label: `${(reportsTo.profile as any)?.first_name} ${(reportsTo.profile as any)?.last_name}`,
									title: `${reportsTo.job_title}`
								},
								width: 240,
								type: 'custom'
							});
						}

						reportTos[activeReportToIndex].nodeId = !!isExistingManager ? `MG${isExistingManager.id}` : `DR${reportsTo.id}`;
					}

					edges.push({
						id: `EE-DR-e-${reportsTo.id}-${member.id}`,
						source: reportTos[activeReportToIndex].nodeId,
						target: `EE${member.id}`,
						animated: true,
						type: 'smoothstep'
					});
				}
			});
		});
	}

	teamless!.forEach(person => {
		nodes.push({
			id: `TL${person.id}`,
			position: { x: 200 + teams!.length * 300, y: 100 },
			data: {
				label: `${person.profile?.first_name} ${person.profile?.last_name}`,
				title: `${person.job_title}`
			},
			width: 240,
			type: 'custom'
		});

		const reportsTo: Tables<'contracts'> | null = person?.direct_report as any;

		if (reportsTo) {
			const isExistingManager = managers!.find(m => (m.person as any).id === reportsTo.id);
			const activeReportToIndex = reportTos.findIndex(rt => rt.id === reportsTo.id);

			if (reportTos[activeReportToIndex].nodeId == '') {
				if (!isExistingManager) {
					nodes.push({
						id: `DR${reportsTo.id}`,
						position: { x: 200 + teams!.length * 300, y: 0 },
						data: {
							label: `${(reportsTo.profile as any)?.first_name} ${(reportsTo.profile as any)?.last_name}`,
							title: `${reportsTo.job_title}`
						},
						width: 240,
						type: 'custom'
					});
				}

				reportTos[activeReportToIndex].nodeId = isExistingManager ? `MG${isExistingManager.id}` : `DR${reportsTo.id}`;
			}

			edges.push({
				id: `TL-DR-e-${reportsTo.id}-${person.id}`,
				source: reportTos[activeReportToIndex].nodeId,
				target: `TL${person.id}`,
				animated: true,
				type: 'smoothstep'
			});
		}
	});

	return (
		<div className="container mx-auto space-y-8 p-0">
			<div className="w-full items-center gap-6">
				<h1 className="text-2xl font-medium">Organisation Chart</h1>
			</div>

			<div className="h-[70vh] w-full">
				<FlowDiagram defaultNodes={nodes} edges={edges} />
			</div>
		</div>
	);
}
