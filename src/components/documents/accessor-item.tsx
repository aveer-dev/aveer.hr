import { Tables } from '@/type/database.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export const DocumentAccessor = ({ accessor, access, onUpdateAccess, onRemove, ownerProfileId }: { onUpdateAccess: (access: 'editor' | 'viewer') => void; accessor: Tables<'contracts'>; access: 'editor' | 'viewer'; ownerProfileId: string; onRemove: () => void }) => {
	return (
		<li className="hov flex items-center justify-between rounded-md py-1">
			<div className="flex items-center gap-2 text-sm">
				<span>
					{(accessor.profile as any)?.first_name} {(accessor.profile as any)?.last_name}
				</span>
				<span>•</span>
				<span className="font-light capitalize text-support">{accessor?.job_title}</span>
			</div>

			<div className="flex items-center gap-2 pr-0.5">
				{ownerProfileId == (accessor.profile as any)?.id ? (
					<div className="text-sm text-muted-foreground">Owner</div>
				) : (
					<>
						<Select defaultValue="viewer" value={access} onValueChange={onUpdateAccess}>
							<SelectTrigger className="w-20" disabled={ownerProfileId == (accessor.profile as any)?.id}>
								<SelectValue placeholder="Select access type" />
							</SelectTrigger>

							<SelectContent align="end">
								<SelectItem value="viewer">Viewer</SelectItem>
								<SelectItem value="editor">Editor</SelectItem>
							</SelectContent>
						</Select>

						<Button variant={'ghost_destructive'} type="button" className="text-destructive" disabled={ownerProfileId == (accessor.profile as any)?.id} onClick={onRemove}>
							<Trash2 size={12} />
						</Button>
					</>
				)}
			</div>
		</li>
	);
};
