import { Card, CardContent } from '@/components/ui/card';
import { Plus, TextCursorInput, Trash2 } from 'lucide-react';
import { FormSection, FormSectionDescription, InputsContainer } from '../form-section';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface props {
	updateCustomFields: (payload: string[]) => void;
	customFields: string[];
}

export const CustomFields = ({ updateCustomFields, customFields }: props) => {
	const [fields, updateFields] = useState<string[]>(customFields);

	return (
		<>
			{!fields.length && (
				<Card>
					<CardContent className="pt-6 text-center text-xs font-light text-muted-foreground">
						<p>You don&apos;t have any custom field yet</p>
						<Button
							type="button"
							onClick={() => {
								updateCustomFields([...fields, '']);
								updateFields([...fields, '']);
							}}
							variant={'secondary'}
							className="mt-6 gap-3">
							<Plus size={12} />
							Custom field
						</Button>
					</CardContent>
				</Card>
			)}

			{fields.length > 0 && (
				<>
					{fields.map((field, index) => (
						<div key={index + 'custom'} className="flex items-center gap-1">
							<Input
								aria-label="field question"
								id={'custom' + index}
								value={field}
								onChange={event => {
									fields[index] = event.target.value;
									updateCustomFields([...fields]);
									updateFields([...fields]);
								}}
								required
								placeholder="Enter custom question"
							/>
							<Button
								type="button"
								onClick={() => {
									fields.splice(index, 1);
									updateCustomFields([...fields]);
									updateFields([...fields]);
								}}
								size={'icon'}
								variant={'ghost'}
								className="text-destructive hover:bg-destructive/5 hover:text-destructive focus:bg-destructive/5 focus:text-destructive">
								<Trash2 size={12} />
							</Button>
						</div>
					))}

					<Button
						type="button"
						onClick={() => {
							updateCustomFields([...fields, '']);
							updateFields([...fields, '']);
						}}
						variant={'secondary'}
						className="mt-2 w-fit gap-3">
						<Plus size={12} />
						<Separator orientation="vertical" />
						Custom field
						<TextCursorInput size={12} />
					</Button>
				</>
			)}
		</>
	);
};
