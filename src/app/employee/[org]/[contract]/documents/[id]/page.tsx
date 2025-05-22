import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DocumentPage } from '@/components/documents/docuement-page';

export default async function TemplatePage(props: { params: Promise<{ [key: string]: string }>; searchParams: Promise<{ [key: string]: string }> }) {
	const params = await props.params;

	return (
		<AlertDialog defaultOpen open={true}>
			<AlertDialogContent id="documentEmployee" className="block h-screen w-full max-w-full overflow-y-auto bg-white pt-24 backdrop-blur-lg">
				<AlertDialogHeader className="hidden">
					<AlertDialogTitle></AlertDialogTitle>
					<AlertDialogDescription></AlertDialogDescription>
				</AlertDialogHeader>

				<div className="mx-auto w-full max-w-5xl">
					<Suspense
						fallback={
							<div className="mx-auto w-full max-w-5xl space-y-4 px-8">
								<div className="flex items-center justify-between">
									<Skeleton className="h-9 w-80" />
									<Skeleton className="h-9 w-24" />
								</div>

								<Separator className="w-full" />

								<div>
									<Skeleton className="mb-6 h-5 w-72" />
									<Skeleton className="mb-4 h-8 w-40" />
									<Skeleton className="mb-4 h-5 w-52" />
									<Skeleton className="mb-6 h-5 w-80" />
									<Skeleton className="mb-6 h-5 w-60" />
								</div>
							</div>
						}>
						<DocumentPage org={params.org} docId={params.id} />
					</Suspense>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
