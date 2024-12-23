'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
const chartData = [
	{ priority: 'urgent', tasks: 173, fill: 'var(--color-urgent)' },
	{ priority: 'high', tasks: 275, fill: 'var(--color-high)' },
	{ priority: 'medium', tasks: 200, fill: 'var(--color-medium)' },
	{ priority: 'low', tasks: 187, fill: 'var(--color-low)' },
	{ priority: 'none', tasks: 90, fill: 'var(--color-none)' }
];

const chartConfig = {
	tasks: {
		label: 'Tasks'
	},
	high: {
		label: 'High',
		color: 'hsl(27.02deg 95.98% 60.98%)'
	},
	medium: {
		label: 'Medium',
		color: 'hsl(47.95deg 95.82% 53.14%)'
	},
	low: {
		label: 'Low',
		color: 'hsl(213.12deg 93.9% 67.84%)'
	},
	urgent: {
		label: 'Urgent',
		color: 'hsl(0deg 90.6% 70.78%)'
	},
	none: {
		label: 'None',
		color: 'hsl(217.89deg 10.61% 64.9%)'
	}
} satisfies ChartConfig;

export function IssuesBarChart() {
	return (
		<div className="mt-16">
			<h3 className="mb-6 text-base font-normal text-support">Tasks by priority</h3>

			<ChartContainer className="h-48 w-full" config={chartConfig}>
				<BarChart
					accessibilityLayer
					data={chartData}
					layout="vertical"
					margin={{
						left: 0
					}}>
					<YAxis dataKey="priority" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => chartConfig[value as keyof typeof chartConfig]?.label} />
					<XAxis dataKey="tasks" type="number" hide />
					<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
					<Bar barSize={14} dataKey="tasks" layout="vertical" radius={10} />
				</BarChart>
			</ChartContainer>
		</div>
	);
}
