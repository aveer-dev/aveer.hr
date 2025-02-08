'use server';

import { PLANE_PROJECT, PLANE_RESPONSE } from './plane.types';

const URL = 'https://api.plane.so/api/v1/workspaces';

export const http = async ({ url, method, headers }: { url: string; method: string; headers: { [key: string]: string } }): Promise<PLANE_RESPONSE> => {
	const options = { method, headers };

	try {
		const response = await fetch(url, options);
		const response_1 = await response.json();
		return response_1;
	} catch (err: any) {
		return err;
	}
};

export const getProject = async ({ workspaceSlug, apiKey, projectId }: { workspaceSlug: string; apiKey: string; projectId: string }): Promise<PLANE_PROJECT> =>
	(await http({ url: `${URL}/${workspaceSlug}/projects/${projectId}`, method: 'GET', headers: { 'x-api-key': apiKey } })) as any;

export const getCycles = async ({ workspaceSlug, apiKey, projectId }: { workspaceSlug: string; apiKey: string; projectId: string }): Promise<PLANE_RESPONSE> =>
	await http({ url: `${URL}/${workspaceSlug}/projects/${projectId}/cycles?expand=state`, method: 'GET', headers: { 'x-api-key': apiKey } });

export const getCycleIssues = async ({ workspaceSlug, apiKey, projectId, cycleId }: { workspaceSlug: string; apiKey: string; projectId: string; cycleId: string }): Promise<PLANE_RESPONSE> =>
	await http({ url: `${URL}/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/?expand=state`, method: 'GET', headers: { 'x-api-key': apiKey } });

export const getAllIssues = async ({ workspaceSlug, apiKey, projectId }: { workspaceSlug: string; apiKey: string; projectId: string }): Promise<PLANE_RESPONSE> =>
	await http({ url: `${URL}/${workspaceSlug}/projects/${projectId}/issues/?expand=assignees,labels,state`, method: 'GET', headers: { 'x-api-key': apiKey } });

export const getIssue = async ({ workspaceSlug, apiKey, projectId, issueId }: { workspaceSlug: string; apiKey: string; projectId: string; issueId: string }): Promise<PLANE_RESPONSE> =>
	await http({ url: `${URL}/${workspaceSlug}/projects/${projectId}/issues/${issueId}`, method: 'GET', headers: { 'x-api-key': apiKey } });

export const getStates = async ({ workspaceSlug, apiKey, projectId }: { workspaceSlug: string; apiKey: string; projectId: string }): Promise<PLANE_RESPONSE> =>
	await http({
		url: `${URL}/${workspaceSlug}/projects/${projectId}/states`,
		method: 'GET',
		headers: { 'x-api-key': apiKey }
	});
