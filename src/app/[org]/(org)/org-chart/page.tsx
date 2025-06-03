import { createClient } from '@/utils/supabase/server';
import FlowDiagram from './flow-diagram';
import { Edge, Node, Position } from '@xyflow/react';
import { Tables } from '@/type/database.types';

export default async function OrgChartPage(props: { params: Promise<{ org: string }> }) {
	const params = await props.params;
	const { org } = params;
	const supabase = await createClient();

	const [{ data: teams, error: teamsError }, { data: people, error: peopleError }, { data: managers, error: managersError }] = await Promise.all([
		supabase.from('teams').select('id, name').match({ org }),
		supabase.from('contracts').select('id, job_title, team, direct_report, profile:profiles!contracts_profile_fkey(id, first_name, last_name)').match({ org }),
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

	// --- Build manager to teams map ---
	const managerTeamsMap = new Map<number, { id: number; name: string }[]>();
	(managers ?? []).forEach(manager => {
		if (!manager.person) return;
		const managerId = manager.person.id;
		const team = manager.team;
		if (!team) return;
		if (!managerTeamsMap.has(managerId)) managerTeamsMap.set(managerId, []);
		if (!managerTeamsMap.get(managerId)!.find(t => t.id === team.id)) {
			managerTeamsMap.get(managerId)!.push({ id: team.id, name: team.name });
		}
	});

	// --- Build nodes and edges ---
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const nodeIds = new Set<string>();
	function addNode(node: Node) {
		if (!nodeIds.has(node.id)) {
			nodes.push(node);
			nodeIds.add(node.id);
		}
	}
	const edgeIds = new Set<string>();
	function addEdge(edge: Edge) {
		if (!edgeIds.has(edge.id)) {
			edges.push(edge);
			edgeIds.add(edge.id);
		}
	}

	// --- Layout constants ---
	const xSpacing = 300;
	const yManager = 100;
	const yTeam = 250;
	const yEmployee = 400;

	// --- Track which manager/team nodes have been rendered ---
	const renderedManagers = new Set<number>();
	const renderedTeamNodes = new Set<number>();

	let globalXOffset = 0;

	// 1. Render managers and their teams (teams horizontally under manager, employees horizontally under team)
	managerTeamsMap.forEach((teamsManaged, managerId) => {
		const manager = managerByPersonId.get(managerId);
		if (!manager || !manager.person) return;
		const nodeId = `MG${manager.id}`;

		// Calculate the width needed for all teams and their employees
		let teamsWidth = 0;
		const teamWidths: number[] = [];
		teamsManaged.forEach(team => {
			const teamEmployees = (people ?? []).filter(person => person.team === team.id);
			const width = Math.max(1, teamEmployees.length) * xSpacing;
			teamWidths.push(width);
			teamsWidth += width;
		});
		if (teamsWidth === 0) teamsWidth = xSpacing;

		// Center manager above all their teams
		const managerX = globalXOffset + teamsWidth / 2 - 120; // 120 = half node width
		if (!renderedManagers.has(managerId)) {
			addNode({
				id: nodeId,
				position: { x: managerX, y: yManager },
				data: {
					label: `${manager.profile?.first_name ?? ''} ${manager.profile?.last_name ?? ''}`.trim(),
					title: manager.person.job_title,
					manager: teamsManaged.map(t => t.name)
				},
				width: 240,
				type: 'custom',
				targetPosition: Position.Top
			});
			renderedManagers.add(managerId);
		}

		// Place teams horizontally under manager
		let teamXOffset = globalXOffset;
		teamsManaged.forEach((team, tIdx) => {
			const teamNodeId = `TEAM${team.id}`;
			const teamWidth = teamWidths[tIdx];
			const teamX = teamXOffset + teamWidth / 2 - 100; // 100 = half team node width
			if (!renderedTeamNodes.has(team.id)) {
				addNode({
					id: teamNodeId,
					position: { x: teamX, y: yTeam },
					data: {
						label: team.name,
						title: 'Team',
						teamId: team.id
					},
					width: 200,
					type: 'custom',
					targetPosition: Position.Top
				});
				addEdge({
					id: `MG-TEAM-e-${manager.id}-${team.id}`,
					source: nodeId,
					target: teamNodeId,
					animated: true,
					type: 'smoothstep',
					className: 'z-100'
				});
				renderedTeamNodes.add(team.id);
			}

			// Place employees horizontally under team
			const teamEmployees = (people ?? []).filter(person => person.team === team.id);
			let employeeXOffset = teamXOffset;
			teamEmployees.forEach((employee, eIdx) => {
				const empNodeId = `EE${employee.id}`;
				addNode({
					id: empNodeId,
					position: { x: employeeXOffset, y: yEmployee },
					data: {
						label: `${employee.profile?.first_name ?? ''} ${employee.profile?.last_name ?? ''}`.trim(),
						title: employee.job_title
					},
					width: 200,
					type: 'custom',
					targetPosition: Position.Top
				});
				addEdge({
					id: `TEAM-EE-e-${team.id}-${employee.id}`,
					source: teamNodeId,
					target: empNodeId,
					animated: true,
					type: 'smoothstep',
					className: 'z-100'
				});
				employeeXOffset += xSpacing;
			});
			if (teamEmployees.length === 0) {
				// Still increment offset for empty teams
				employeeXOffset += xSpacing;
			}
			teamXOffset += teamWidth;
		});
		globalXOffset += teamsWidth + xSpacing;
	});

	// 2. Render direct report relationships for non-managers
	const managerIds = new Set([...managerTeamsMap.keys()]);
	const directReporters = (people ?? []).filter(person => person.direct_report && !managerIds.has(person.id));
	directReporters.forEach((person, idx) => {
		const nodeId = `DR${person.id}`;
		addNode({
			id: nodeId,
			position: { x: globalXOffset + idx * xSpacing, y: yManager },
			data: {
				label: `${person.profile?.first_name ?? ''} ${person.profile?.last_name ?? ''}`.trim(),
				title: person.job_title
			},
			width: 240,
			type: 'custom',
			targetPosition: Position.Top
		});
		// Render employees who report to this person
		const reports = (people ?? []).filter(p => p.direct_report === person.id);
		reports.forEach((report, rIdx) => {
			const reportNodeId = `EE${report.id}`;
			addNode({
				id: reportNodeId,
				position: { x: globalXOffset + idx * xSpacing + rIdx * xSpacing, y: yEmployee },
				data: {
					label: `${report.profile?.first_name ?? ''} ${report.profile?.last_name ?? ''}`.trim(),
					title: report.job_title
				},
				width: 200,
				type: 'custom',
				targetPosition: Position.Top
			});
			addEdge({
				id: `DR-EE-e-${person.id}-${report.id}`,
				source: nodeId,
				target: reportNodeId,
				animated: true,
				type: 'smoothstep',
				className: 'z-100'
			});
		});
	});

	// 3. Add teamless people (not in any team, but have a direct_report)
	const teamIds = new Set((teams ?? []).map(t => t.id));
	const teamless = (people ?? []).filter(person => !person.team || !teamIds.has(person.team));
	teamless.forEach((person, idx) => {
		const nodeId = `TL${person.id}`;
		addNode({
			id: nodeId,
			position: { x: globalXOffset + idx * xSpacing, y: yEmployee + 150 },
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
						position: { x: globalXOffset + idx * xSpacing, y: yManager },
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
