'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tables } from '@/type/database.types';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface props {
	questions: Tables<'appraisal_questions'>[];
}

export const AppraisalForm = ({ questions }: props) => {
	const formSchema = z.object({
		answers: z
			.object({ id: z.number(), answer: z.string().optional(), group: z.string(), required: z.boolean() })
			.array()
			.refine(
				answers => {
					console.log(answers.filter(answer => answer.required && !answer.answer));
					return !answers.filter(answer => answer.required && !answer.answer).length;
				},
				{ message: 'You must answer all required questions' }
			)
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			answers: questions.map(question => ({ answer: '', id: question.id, group: question.group, required: question.required }))
		}
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		console.log(values);
	};

	const InputFields = ({ question, field }: { question: Tables<'appraisal_questions'>; field: any }) => {
		if (question.type == 'text') {
			return (
				<FormControl>
					<Input type="text" placeholder="Enter answer here" required={question.required} {...field} />
				</FormControl>
			);
		}

		if (question.type == 'number') {
			return (
				<FormControl>
					<Input type="number" placeholder="Enter answer here" required={question.required} {...field} />
				</FormControl>
			);
		}

		if (question.type == 'textarea') {
			return (
				<FormControl>
					<Textarea placeholder="Enter answer here" required={question.required} {...field} />
				</FormControl>
			);
		}

		if (question.type == 'date') {
			return (
				<FormControl>
					<DatePicker onSetDate={field.onChange} selected={field.value ? new Date(field.value) : undefined} />
				</FormControl>
			);
		}

		if (question.type == 'file') {
			return (
				<FormControl>
					<Input type="file" placeholder="Select file" required={question.required} {...field} />
				</FormControl>
			);
		}

		if (question.type == 'select') {
			return (
				<FormControl>
					<RadioGroup required={question.required} onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
						{(question.options as string[])?.map((option, index) => (
							<FormItem key={index} className="flex items-center space-x-3 space-y-0">
								<FormControl>
									<RadioGroupItem value={option} />
								</FormControl>
								<FormLabel className="font-normal">{option}</FormLabel>
							</FormItem>
						))}
					</RadioGroup>
				</FormControl>
			);
		}

		if (question.type == 'multiselect') {
			return (question.options as string[])?.map((option, index) => {
				const isChecked = field.value.includes(option) || field.value == option;

				return (
					<FormItem key={index} className="flex items-center space-x-3 space-y-0">
						<FormControl>
							<Checkbox
								checked={isChecked}
								onCheckedChange={value => {
									const currentValue = field.value;
									const answer = currentValue ? currentValue.split(',') : option;
									if (typeof answer !== 'string') answer.push(option);
									const finalAnswer = answer.toString();

									value
										? field.onChange(finalAnswer)
										: field.onChange(
												currentValue
													.split(',')
													.filter((answer: string) => answer !== option)
													.toString()
											);
								}}
							/>
						</FormControl>
						<FormLabel className="font-normal">{option}</FormLabel>
					</FormItem>
				);
			});
		}

		return (
			<FormControl>
				<Input type="text" placeholder="Enter answer here" {...field} />
			</FormControl>
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name={`answers`}
					render={() => (
						<FormItem className="space-y-10">
							{questions.map((question, index) => (
								<FormField
									control={form.control}
									key={question.id}
									name={`answers.${index}.answer`}
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel>
												{question.required && <span className="mr-1 text-sm text-destructive">*</span>}
												{question.question}
											</FormLabel>
											<InputFields question={question} field={field} />
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormDescription>
					<span className="mr-1 text-sm text-destructive">* </span> Indicates required fields
				</FormDescription>

				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
};
