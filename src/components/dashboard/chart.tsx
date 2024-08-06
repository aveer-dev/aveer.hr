'use client';

import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

export const Chart = () => {
	const chartData = [
		{ month: 'January', desktop: 186, mobile: 80 },
		{ month: 'February', desktop: 305, mobile: 200 },
		{ month: 'March', desktop: 237, mobile: 120 },
		{ month: 'April', desktop: 73, mobile: 190 },
		{ month: 'May', desktop: 209, mobile: 130 },
		{ month: 'June', desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			color: '#2563eb'
		},
		mobile: {
			label: 'Mobile',
			color: '#60a5fa'
		}
	} satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="min-h-[100px] w-48">
			<BarChart accessibilityLayer data={chartData}>
				<XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => value.slice(0, 3)} />
				<Bar dataKey="mobile" barSize={4} fill="hsl(0deg 0% 68.53%)" radius={4} />
			</BarChart>
		</ChartContainer>
	);
};
