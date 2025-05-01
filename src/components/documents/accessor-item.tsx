import { Tables } from '@/type/database.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DOCUMENT_ACCESS_TYPE, SHARED_WITH } from './types';
import { useProfile } from '@/hooks/use-profile';
import { Skeleton } from '@/components/ui/skeleton';

export const DocumentAccessor = ({ accessor, user, onUpdateAccess, onRemove, ownerProfileId }: { onUpdateAccess: (access: DOCUMENT_ACCESS_TYPE) => void; accessor?: Tables<'contracts'>; user: SHARED_WITH; ownerProfileId: string; onRemove: () => void }) => {
	const { profile, isLoading } = useProfile({
		id: user.profile,
		enabled: !accessor
	});

	if (!accessor && isLoading) {
		return (
			<li className="flex items-center justify-between rounded-md py-1">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-32" />
					<span>•</span>
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-8" />
				</div>
			</li>
		);
	}

	const _profile = accessor?.profile as any;
	const firstName = _profile?.first_name || profile?.first_name;
	const lastName = _profile?.last_name || profile?.last_name;
	const jobTitle = accessor?.job_title;
	const profileId = _profile?.id || profile?.id;

	if (!firstName || !lastName) return null;

	return (
		<li className="flex items-center justify-between rounded-md bg-muted px-2 py-2">
			<div className="flex items-center gap-2 text-sm">
				<span>
					{firstName} {lastName}
				</span>

				{jobTitle && (
					<>
						<span>•</span>
						<span className="font-light capitalize text-support">{jobTitle}</span>
					</>
				)}
			</div>

			<div className="flex items-center gap-2 pr-0.5">
				{ownerProfileId === profileId ? (
					<div className="text-xs text-muted-foreground">Owner</div>
				) : (
					<>
						<Select defaultValue="viewer" value={user.access} onValueChange={onUpdateAccess}>
							<SelectTrigger className="w-20" disabled={ownerProfileId === profileId}>
								<SelectValue placeholder="Select access type" />
							</SelectTrigger>

							<SelectContent align="end">
								<SelectItem value="viewer">Viewer</SelectItem>
								<SelectItem value="editor">Editor</SelectItem>
							</SelectContent>
						</Select>

						<Button variant={'ghost_destructive'} type="button" className="text-destructive" disabled={ownerProfileId === profileId} onClick={onRemove}>
							<Trash2 size={12} />
						</Button>
					</>
				)}
			</div>
		</li>
	);
};
