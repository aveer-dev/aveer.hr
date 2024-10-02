import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Tables } from '@/type/database.types';
import { FORM_INPUT_TYPE } from '@/type/performance.types';

export const InputFields = ({ question, field, isSubmitted }: { question: Tables<'appraisal_questions'>; field: any; isSubmitted: boolean }) => {
	const type: FORM_INPUT_TYPE = question.type as any;

	if (type == 'text') {
		return (
			<FormControl>
				<Input disabled={isSubmitted} type="text" placeholder="Enter answer here" required={question.required} {...field} />
			</FormControl>
		);
	}

	if (type == 'number') {
		return (
			<FormControl>
				<Input disabled={isSubmitted} type="number" placeholder="Enter answer here" required={question.required} {...field} />
			</FormControl>
		);
	}

	if (type == 'textarea') {
		return (
			<FormControl>
				<Textarea disabled={isSubmitted} placeholder="Enter answer here" required={question.required} {...field} />
			</FormControl>
		);
	}

	if (type == 'date') {
		return (
			<FormControl>
				<DatePicker disableButton={isSubmitted} onSetDate={date => field.onChange(date.toISOString())} selected={field.value ? new Date(field.value) : undefined} />
			</FormControl>
		);
	}

	if (type == 'select') {
		return (
			<FormControl>
				<RadioGroup required={question.required} onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
					{(question.options as string[])?.map((option, index) => (
						<FormItem key={index} className="flex items-center space-x-3 space-y-0">
							<FormControl>
								<RadioGroupItem disabled={isSubmitted} value={option} />
							</FormControl>
							<FormLabel className="font-normal">{option}</FormLabel>
						</FormItem>
					))}
				</RadioGroup>
			</FormControl>
		);
	}

	if (type == 'multiselect') {
		return (question.options as string[])?.map((option, index) => {
			const isChecked = field.value.includes(option) || field.value == option;

			return (
				<FormItem key={index} className="flex items-center space-x-3 space-y-0">
					<FormControl>
						<Checkbox
							disabled={isSubmitted}
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
			<Input disabled={isSubmitted} type="text" placeholder="Enter answer here" {...field} />
		</FormControl>
	);
};
