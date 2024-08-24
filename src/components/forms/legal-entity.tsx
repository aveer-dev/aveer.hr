import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tables } from '@/type/database.types';

interface props {
	form: UseFormReturn<any>;
	entities: Tables<'legal_entities'>[];
	eorEntities: Tables<'legal_entities'>[];
}

export const SelectLegalEntity = ({ form, entities, eorEntities }: props) => {
	return (
		<FormField
			control={form.control}
			name="entity"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Legal entity</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value ? field.value : undefined}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select legal entity you'd like to hire under" />
							</SelectTrigger>
						</FormControl>

						<SelectContent>
							<SelectGroup>
								{entities.length !== 0 && <SelectLabel>Your Legal Entities</SelectLabel>}
								{entities.map(entity => (
									<SelectItem key={entity.id} value={String(entity.id)}>
										{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
									</SelectItem>
								))}
							</SelectGroup>

							{entities.length !== 0 && <Separator className="my-3" />}

							<SelectGroup>
								{eorEntities.length && <SelectLabel>Hire with aveer.hr</SelectLabel>}
								{eorEntities.map(entity => (
									<SelectItem key={entity.id} value={String(entity.id)}>
										{entity?.name} • <span className="text-muted-foreground">{entity.incorporation_country}</span>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<FormMessage />
				</FormItem>
			)}
		/>
	);
};