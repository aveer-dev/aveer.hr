import { Info, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { deleteGoalFile, getGoalFileUrl, uploadGoalFile } from './appraisal.actions';
import { Tables } from '@/type/database.types';
import { Goal, GOAL_SCORE, Objective } from './appraisal.types';
import { useState } from 'react';
import { LoadingSpinner } from '../ui/loader';
import { TooltipProvider } from '../ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const GoalFileUpload = ({
	updateGoalFile,
	org,
	goal,
	appraisalCycleId,
	canView,
	canUpload
}: {
	updateGoalFile: ({ filePath, fileName }: { filePath: string; fileName: string }) => void;
	org: string;
	goal: GOAL_SCORE;
	appraisalCycleId: number;
	canView: boolean;
	canUpload: boolean;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, goalId: string) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const uploadPromise = uploadGoalFile({ file, org, goalId, appraisalId: appraisalCycleId })
			.then(filePath => {
				updateGoalFile({
					filePath,
					fileName: file.name
				});
				return file;
			})
			.catch(error => {
				console.error('Error during file upload:', error);
				throw error;
			});

		toast.promise(uploadPromise, {
			loading: 'Uploading file...',
			success: uploadedFile => {
				return `${uploadedFile.name} has been uploaded successfully`;
			},
			error: (error: Error) => error.message
		});
	};

	const handleFileDelete = async (goalId: string, filePath: string) => {
		const deletePromise = deleteGoalFile({ filePath })
			.then(() => {
				updateGoalFile({
					filePath: '',
					fileName: ''
				});
				return filePath;
			})
			.catch(error => {
				console.error('Error during file deletion:', error);
				throw error;
			});

		toast.promise(deletePromise, {
			loading: 'Deleting file...',
			success: () => 'File has been deleted successfully',
			error: (error: Error) => error.message
		});
	};

	const loadFile = async () => {
		const filePath = goal.filePath;
		if (!filePath) return;
		setIsLoading(true);

		try {
			const publicUrl = await getGoalFileUrl({ filePath });

			window.open(publicUrl, '_blank', 'noopener,noreferrer');
		} catch (error) {
			console.error('Error getting file URL:', error);
			toast.error('Failed to open file');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			{canUpload && (
				<>
					<input type="file" id={`file-upload-${goal.goal_id}`} className="hidden" onChange={e => handleFileUpload(e, goal.goal_id)} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" />
					<label htmlFor={`file-upload-${goal.goal_id}`}>
						<Button variant="outline" className="gap-2" asChild>
							<div>
								<Paperclip size={14} />
								{goal.fileName ? (
									<div className="flex items-center gap-2">
										<span className="max-w-[150px] truncate">{goal.fileName}</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-4 w-4"
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												if (goal.filePath) {
													handleFileDelete(goal.goal_id, goal.filePath);
												}
											}}>
											×
										</Button>
									</div>
								) : (
									'Attach File'
								)}
							</div>
						</Button>
					</label>
				</>
			)}

			{!canUpload && canView && (
				<>
					<Button variant="link" className="h-auto gap-2 p-0 text-xs" onClick={loadFile} disabled={isLoading}>
						{isLoading ? <LoadingSpinner /> : <Paperclip size={14} />}
						View Document: {goal.fileName}
					</Button>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="ml-2 h-fit w-fit p-0 text-muted-foreground">
									<Info size={12} />
								</Button>
							</TooltipTrigger>

							<TooltipContent>Link will expire in 1 minute</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</>
			)}
		</div>
	);
};
