import { createClient } from '@/utils/supabase/server';
import FlowDiagram from './flow-diagram';
import { Edge, Node, Position } from '@xyflow/react';

export default async function OrgChartPage(props: { params: Promise<{ org: string }> }) {
	const params = await props.params;
	const { org } = params;
	const supabase = await createClient();

	const [{ data: teams, error: teamsError }, { data: people, error: peopleError }, { data: managers, error: managersError }] = await Promise.all([
		supabase.from('teams').select('id, name').match({ org }),
		supabase.from('contracts').select('id, job_title, team, direct_report, profile:profiles!contracts_profile_fkey(id, first_name, last_name)').match({ org, status: 'signed' }),
		supabase.from('managers').select('id, team:teams!managers_team_fkey(id, name), profile:profiles!managers_profile_fkey(first_name, last_name), person(id, team, job_title, direct_report)').match({ org })
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

	// --- Build lookup maps for O(1) access ---
	const teamMap = new Map<number, { id: number; name: string }>((teams ?? []).map(team => [team.id, team]));
	const personMap = new Map<number, { id: number; job_title: string; team: number | null; direct_report: number | null; profile: { id: string; first_name: string; last_name: string } | null }>((people ?? []).map(person => [person.id, person]));
	const managerByPersonId = new Map<number, { id: number; team: { id: number; name: string }; profile: { first_name: string; last_name: string } | null; person: { id: number; team: number | null; job_title: string; direct_report: number | null } | null }>(
		(managers ?? []).filter(manager => manager.person && typeof manager.person.id === 'number').map(manager => [manager.person!.id, manager])
	);
	const managersByTeamId = new Map<number, { id: number; team: { id: number; name: string }; profile: { first_name: string; last_name: string } | null; person: { id: number; team: number | null; job_title: string; direct_report: number | null } | null }[]>();
	(managers ?? []).forEach(manager => {
		if (!manager.team || !manager.person) return;
		const teamId = manager.team.id;
		if (!managersByTeamId.has(teamId)) managersByTeamId.set(teamId, []);
		managersByTeamId.get(teamId)!.push(manager);
	});

	// --- Build nodes and edges ---
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const nodeIds = new Set<string>();

	// Helper to add node only once
	function addNode(node: Node) {
		if (!nodeIds.has(node.id)) {
			nodes.push(node);
			nodeIds.add(node.id);
		}
	}

	// Helper to add edge only once
	const edgeIds = new Set<string>();
	function addEdge(edge: Edge) {
		if (!edgeIds.has(edge.id)) {
			edges.push(edge);
			edgeIds.add(edge.id);
		}
	}

	// --- Build org chart ---
	let xOffset = 200;
	const yManager = 100;
	const yEmployee = 400;
	const yReportTo = 0;
	const yTeamless = 200;

	// 1. Add teams and their managers/employees
	for (const team of teams ?? []) {
		const teamManagers = managersByTeamId.get(team.id) ?? [];
		const teamEmployees = (people ?? []).filter(person => person.team === team.id);

		teamManagers.forEach((manager, mIdx) => {
			if (!manager.person) return;
			const managerId = manager.person.id;
			const nodeId = `MG${manager.id}`;
			const x = xOffset + mIdx * 300;
			// Manager node
			addNode({
				id: nodeId,
				position: { x, y: yManager },
				data: {
					label: `${manager.profile?.first_name ?? ''} ${manager.profile?.last_name ?? ''}`.trim(),
					title: manager.person.job_title,
					manager: [team.name]
				},
				width: 240,
				type: 'custom',
				targetPosition: Position.Top
			});

			// If manager reports to another person
			if (manager.person.direct_report) {
				const reportToId = manager.person.direct_report;
				const reportToManager = managerByPersonId.get(reportToId);
				const reportToNodeId = reportToManager ? `MG${reportToManager.id}` : `DR${reportToId}`;
				if (!reportToManager) {
					const reportToPerson = personMap.get(reportToId);
					if (reportToPerson) {
						addNode({
							id: reportToNodeId,
							position: { x, y: yReportTo },
							data: {
								label: `${reportToPerson.profile?.first_name ?? ''} ${reportToPerson.profile?.last_name ?? ''}`.trim(),
								title: reportToPerson.job_title
							},
							width: 240,
							type: 'custom',
							targetPosition: Position.Top
						});
					}
				}
				addEdge({
					id: `MG-DR-e-${reportToId}-${manager.id}`,
					source: reportToNodeId,
					target: nodeId,
					animated: true,
					type: 'smoothstep',
					className: 'z-100'
				});
			}

			// Employees in this team
			teamEmployees.forEach((employee, eIdx) => {
				if (employee.id === managerId) return; // skip self
				const empNodeId = `EE${employee.id}`;
				addNode({
					id: empNodeId,
					position: { x, y: yEmployee + eIdx * 70 },
					data: {
						label: `${employee.profile?.first_name ?? ''} ${employee.profile?.last_name ?? ''}`.trim(),
						title: employee.job_title
					},
					width: 240,
					type: 'custom',
					targetPosition: Position.Top
				});
				addEdge({
					id: `EE-e-${employee.id}-${manager.id}`,
					source: nodeId,
					target: empNodeId,
					animated: true,
					type: 'smoothstep',
					className: 'z-100'
				});

				// If employee reports to someone else (not this manager)
				if (employee.direct_report && employee.direct_report !== managerId) {
					const reportToManager = managerByPersonId.get(employee.direct_report);
					const reportToNodeId = reportToManager ? `MG${reportToManager.id}` : `DR${employee.direct_report}`;
					if (!reportToManager) {
						const reportToPerson = personMap.get(employee.direct_report);
						if (reportToPerson) {
							addNode({
								id: reportToNodeId,
								position: { x, y: yReportTo },
								data: {
									label: `${reportToPerson.profile?.first_name ?? ''} ${reportToPerson.profile?.last_name ?? ''}`.trim(),
									title: reportToPerson.job_title
								},
								width: 240,
								type: 'custom',
								targetPosition: Position.Top
							});
						}
					}
					addEdge({
						id: `EE-DR-e-${employee.direct_report}-${employee.id}`,
						source: reportToNodeId,
						target: empNodeId,
						animated: true,
						type: 'smoothstep',
						className: 'z-100'
					});
				}
			});
		});
		xOffset += 300 * Math.max(1, teamManagers.length);
	}

	// 2. Add teamless people (not in any team, but have a direct_report)
	const teamIds = new Set((teams ?? []).map(t => t.id));
	const teamless = (people ?? []).filter(person => !person.team || !teamIds.has(person.team));
	teamless.forEach((person, idx) => {
		const nodeId = `TL${person.id}`;
		addNode({
			id: nodeId,
			position: { x: xOffset + idx * 300, y: yTeamless },
			data: {
				label: `${person.profile?.first_name ?? ''} ${person.profile?.last_name ?? ''}`.trim(),
				title: person.job_title
			},
			width: 240,
			type: 'custom',
			targetPosition: Position.Top
		});
		if (person.direct_report) {
			const reportToManager = managerByPersonId.get(person.direct_report);
			const reportToNodeId = reportToManager ? `MG${reportToManager.id}` : `DR${person.direct_report}`;
			if (!reportToManager) {
				const reportToPerson = personMap.get(person.direct_report);
				if (reportToPerson) {
					addNode({
						id: reportToNodeId,
						position: { x: xOffset + idx * 300, y: yReportTo },
						data: {
							label: `${reportToPerson.profile?.first_name ?? ''} ${reportToPerson.profile?.last_name ?? ''}`.trim(),
							title: reportToPerson.job_title
						},
						width: 240,
						type: 'custom',
						targetPosition: Position.Top
					});
				}
			}
			addEdge({
				id: `TL-DR-e-${person.direct_report}-${person.id}`,
				source: reportToNodeId,
				target: nodeId,
				animated: true,
				type: 'smoothstep',
				className: 'z-100'
			});
		}
	});

	return (
		<div className="absolute bottom-0 left-0 right-0 top-32 mx-auto space-y-8 p-0">
			<div className="h-[85vh] w-full">
				<FlowDiagram defaultNodes={nodes} edges={edges} />
			</div>
		</div>
	);
}
