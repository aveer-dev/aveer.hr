import { createClient } from '@/utils/supabase/server';
import { OKR } from './okr';

interface props {
	org: string;
}

export const OKRs = async ({ org }: props) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('okrs').select().eq('org', org);

	if (error) return error.message;

	const getObjectives = async (okr: number) => await supabase.from('okr_objectives').select().match({ org, okr });

	const getResults = async (query: { org: string; okr: number; okr_objective: number }) => {
		const { data } = await supabase.from('okr_results').select().match(query);
		if (data) return data;
	};

	return (
		<>
			{data.map(async okr => {
				let objectives: any;
				let objectives_results: any[] = [];

				if (okr) {
					objectives = await getObjectives(okr.id);
					if (objectives.error) return objectives.error.message;
				}

				if (okr && objectives) {
					for (let index = 0; index < objectives?.data.length; index++) {
						const objective = objectives?.data[index];

						const results = await getResults({ org, okr: okr.id, okr_objective: objective.id });
						const item = { ...objective, results };
						objectives_results.push(item);
					}
				}

				return <OKR objResult={objectives_results} key={okr.id} okr={okr} org={org} />;
			})}

			<OKR org={org} />
		</>
	);
};
