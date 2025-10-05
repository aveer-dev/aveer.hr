import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'supabase';
import { Resend } from 'resend';
import { render } from 'react-email';
import { addDays, subDays } from 'date-fns';
import { AppraisalEmail } from './_templates/appraisal-email.tsx';
import React from 'react';
import { Database, Tables } from '../_utils/database.types.ts';

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(RESEND_API_KEY);

type AppraisalNotification = Tables<'appraisal_email_notifications'> & { appraisal_cycle: Tables<'appraisal_cycles'> };

interface EmailRecipient {
	id: number;
	email: string;
	name: string;
	type: 'admin' | 'employee' | 'manager';
}

interface EmailData {
	to: string;
	subject: string;
	body: string;
	recipient_name: string;
	appraisal_name: string;
	appraisal_description: string;
	start_date: string;
	end_date: string;
	self_review_due_date: string;
	manager_review_due_date: string;
}

const BATCH_SIZE = 50;

/**
 * Process pending scheduled emails that are due
 */
async function processPendingEmails(): Promise<{ processed: number; errors: number }> {
	const now = new Date();
	let processed = 0;
	let errors = 0;

	try {
		// Fetch pending emails that are due
		const { data: emails, error: fetchError } = await supabase.from('appraisal_scheduled_emails').select('*').eq('status', 'pending').lte('scheduled_for', now.toISOString()).limit(BATCH_SIZE);

		if (fetchError) {
			console.error('Error fetching pending emails:', fetchError);
			return { processed: 0, errors: 1 };
		}

		if (!emails || emails.length === 0) {
			return { processed: 0, errors: 0 };
		}

		// Process emails in parallel
		const processPromises = emails.map(async email => {
			try {
				await processSingleEmail(email);
				processed++;
			} catch (error) {
				console.error(`Error processing email ${email.id}:`, error);
				await handleEmailError(email, error as Error);
				errors++;
			}
		});

		await Promise.all(processPromises);
	} catch (error) {
		console.error('Error in processPendingEmails:', error);
		errors++;
	}

	return { processed, errors };
}

/**
 * Process a single email
 */
async function processSingleEmail(email: Tables<'appraisal_scheduled_emails'>): Promise<void> {
	try {
		// Get organization name
		const { data: orgData } = await supabase.from('organisations').select('name').eq('subdomain', email.org).single();

		const orgName = orgData?.name || 'Aveer.hr';
		const emailData = email.email_data as unknown as EmailData;

		// Render email template
		const emailHtml = await render(
			React.createElement(AppraisalEmail, {
				recipientName: emailData.recipient_name,
				appraisalName: emailData.appraisal_name,
				appraisalDescription: emailData.appraisal_description,
				startDate: emailData.start_date,
				endDate: emailData.end_date,
				selfReviewDueDate: emailData.self_review_due_date,
				managerReviewDueDate: emailData.manager_review_due_date,
				emailType: email.email_type,
				orgName
			})
		);

		// Send email via Resend
		const { data, error } = await resend.emails.send({
			from: 'Aveer.hr <support@notification.aveer.hr>',
			to: (email.email_data as { to: string })?.to,
			subject: (email.email_data as { subject: string })?.subject,
			html: emailHtml
		});

		if (error) {
			throw new Error(`Resend error: ${JSON.stringify(error)}`);
		}

		// Update email status to sent
		const { error: updateError } = await supabase
			.from('appraisal_scheduled_emails')
			.update({
				status: 'sent',
				resend_email_id: data?.id,
				processed_at: new Date().toISOString()
			})
			.eq('id', email.id);

		if (updateError) {
			console.error('Error updating email status:', updateError);
		}

		console.log(`Email ${email.id} sent successfully to ${(email.email_data as { to: string })?.to}`);
	} catch (error) {
		console.error(`Error sending email ${email.id}:`, error);
		throw error;
	}
}

/**
 * Handle email processing errors
 */
async function handleEmailError(email: Tables<'appraisal_scheduled_emails'>, error: Error): Promise<void> {
	const newRetryCount = email.retry_count ?? 0 + 1;
	const shouldRetry = newRetryCount <= (email?.max_retries || 3);

	const updateData: { retry_count: number; error_message: string; scheduled_for?: string; status?: Database['public']['Enums']['email_status'] } = {
		retry_count: newRetryCount,
		error_message: error.message || 'Unknown error'
	};

	if (shouldRetry) {
		// Schedule retry for later (exponential backoff)
		const retryDelay = Math.pow(2, newRetryCount) * 60 * 60 * 1000; // hours
		const retryTime = new Date(Date.now() + retryDelay);
		updateData.scheduled_for = retryTime.toISOString();
		updateData.status = 'pending';
	} else {
		// Max retries reached, mark as failed
		updateData.status = 'failed';
	}

	const { error: updateError } = await supabase.from('appraisal_scheduled_emails').update(updateData).eq('id', email.id);

	if (updateError) {
		console.error('Error updating email error status:', updateError);
	}
}

/**
 * Process future notifications that should now be scheduled
 */
async function processFutureNotifications(): Promise<{ processed: number; errors: number }> {
	const now = new Date();
	const thirtyDaysFromNow = addDays(now, 30);
	let processed = 0;
	let errors = 0;

	try {
		// Fetch active notifications
		const { data: notifications, error: fetchError } = await supabase.from('appraisal_email_notifications').select('*, appraisal_cycle!inner(*)').eq('is_active', true).limit(BATCH_SIZE);

		if (fetchError) {
			console.error('Error fetching notifications:', fetchError);
			return { processed: 0, errors: 1 };
		}

		if (!notifications || notifications.length === 0) {
			return { processed: 0, errors: 0 };
		}

		// Process notifications
		for (const notification of notifications) {
			try {
				const shouldProcess = checkNotificationShouldProcess(notification.appraisal_cycle, now, thirtyDaysFromNow);

				if (shouldProcess) {
					await processNotification(notification);
					processed++;
				}
			} catch (error) {
				console.error(`Error processing notification ${notification.id}:`, error);
				errors++;
			}
		}
	} catch (error) {
		console.error('Error in processFutureNotifications:', error);
		errors++;
	}

	return { processed, errors };
}

/**
 * Check if a notification should be processed
 */
function checkNotificationShouldProcess(appraisalCycle: Tables<'appraisal_cycles'>, now: Date, thirtyDaysFromNow: Date): boolean {
	if (!appraisalCycle) {
		return false;
	}

	const dates = [new Date(appraisalCycle.start_date), new Date(appraisalCycle.end_date), new Date(appraisalCycle.self_review_due_date), new Date(appraisalCycle.manager_review_due_date)];

	// Check if any date is within the next 30 days
	return dates.some(date => date >= now && date <= thirtyDaysFromNow);
}

/**
 * Process a single notification
 */
async function processNotification(notification: AppraisalNotification): Promise<void> {
	try {
		const appraisalCycle = notification.appraisal_cycle;

		// Import the email scheduler (we'll need to adapt this for edge functions)
		// For now, we'll create the emails directly
		await createScheduledEmailsForCycle(appraisalCycle);

		// Mark notification as processed
		await supabase
			.from('appraisal_email_notifications')
			.update({
				is_active: false,
				last_processed_at: new Date().toISOString()
			})
			.eq('id', notification.id);

		console.log(`Notification ${notification.id} processed successfully`);
	} catch (error) {
		console.error(`Error processing notification ${notification.id}:`, error);
		throw error;
	}
}

/**
 * Create scheduled emails for an appraisal cycle
 * This is a simplified version of the email scheduler for edge functions
 */
async function createScheduledEmailsForCycle(appraisalCycle: Tables<'appraisal_cycles'>): Promise<void> {
	const now = new Date();
	const thirtyDaysFromNow = addDays(now, 30);

	// Get recipients (simplified version)
	const recipients = await getRecipientsForCycle(appraisalCycle);

	// Schedule emails for dates within 30 days
	const dates: { date: string; type: 'start' | 'end' | 'self_review' | 'manager_review' }[] = [
		{ date: appraisalCycle.start_date, type: 'start' },
		{ date: appraisalCycle.end_date, type: 'end' },
		{ date: appraisalCycle.self_review_due_date, type: 'self_review' },
		{ date: appraisalCycle.manager_review_due_date, type: 'manager_review' }
	];

	for (const { date, type } of dates) {
		const targetDate = new Date(date);

		if (targetDate >= now && targetDate <= thirtyDaysFromNow) {
			await scheduleEmailsForDate(appraisalCycle, recipients, targetDate, type);
		}
	}
}

/**
 * Get recipients for an appraisal cycle (simplified)
 */
async function getRecipientsForCycle(appraisalCycle: Tables<'appraisal_cycles'>): Promise<EmailRecipient[]> {
	const recipients: EmailRecipient[] = [];

	// Get admins
	const { data: admins } = await supabase.from('profiles_roles').select('id, profile!inner(id, first_name, last_name, email)').match({ organisation: appraisalCycle.org, role: 'admin' });

	if (admins) {
		recipients.push(
			...admins.map(admin => ({
				id: admin.id,
				email: admin.profile.email,
				name: `${admin.profile.first_name} ${admin.profile.last_name}`,
				type: 'admin' as const
			}))
		);
	}

	// Add employee and manager if specific employee
	if (appraisalCycle.employee) {
		const { data: employee } = await supabase
			.from('contracts')
			.select('id, profile:profiles!contracts_profile_fkey(id, first_name, last_name, email), direct_report:contracts!contracts_direct_report_fkey(id, profile:profiles!contracts_profile_fkey(first_name, last_name, email)), team')
			.match({ id: appraisalCycle.employee, org: appraisalCycle.org, status: 'signed' })
			.single();

		if (employee && employee.profile) {
			recipients.push({
				id: employee.id,
				email: employee.profile.email,
				name: `${employee.profile.first_name} ${employee.profile.last_name}`,
				type: 'employee'
			});

			if (employee.direct_report && employee.direct_report[0]?.profile) {
				recipients.push({
					id: employee.direct_report[0].id,
					email: employee.direct_report[0].profile.email,
					name: `${employee.direct_report[0].profile.first_name} ${employee.direct_report[0].profile.last_name}`,
					type: 'manager'
				});
			}

			// Get manager if exists
			if (employee.team) {
				const { data: managers } = await supabase.from('managers').select('id, profile!inner(id, first_name, last_name, email)').match({ team: employee.team, org: appraisalCycle.org });

				if (managers && managers.length > 0) {
					for (const manager of managers) {
						recipients.push({
							id: manager.id,
							email: manager.profile?.email ?? '',
							name: `${manager.profile?.first_name ?? ''} ${manager.profile?.last_name ?? ''}`,
							type: 'manager'
						});
					}
				}
			}
		}
	} else {
		// For organization-wide appraisals, get all employees and their managers
		const { data: employees } = await supabase.from('contracts').select('id, profile:profiles!contracts_profile_fkey(id, first_name, last_name, email)').match({ org: appraisalCycle.org, status: 'signed' });

		if (employees) {
			// Add employees
			recipients.push(
				...employees.map(emp => ({
					id: emp.id,
					email: emp.profile?.email ?? '',
					name: `${emp.profile?.first_name ?? ''} ${emp.profile?.last_name ?? ''}`,
					type: 'employee' as const
				}))
			);

			// Add managers
			const { data: managers } = await supabase.from('managers').select('id, profile!inner(id, first_name, last_name, email)').match({ org: appraisalCycle.org });

			if (managers && managers.length > 0) {
				for (const manager of managers) {
					recipients.push({
						id: manager.id,
						email: manager.profile?.email ?? '',
						name: `${manager.profile?.first_name ?? ''} ${manager.profile?.last_name ?? ''}`,
						type: 'manager'
					});
				}
			}
		}
	}

	return recipients;
}

/**
 * Schedule emails for a specific date and type
 */
async function scheduleEmailsForDate(appraisalCycle: Tables<'appraisal_cycles'>, recipients: EmailRecipient[], targetDate: Date, type: 'start' | 'end' | 'self_review' | 'manager_review'): Promise<void> {
	const dayBefore = subDays(targetDate, 1);
	const dayOf = targetDate;
	const adminRecipients = recipients.filter(r => r.type === 'admin');
	const selfReviewRecipients = recipients.filter(r => r.type === 'admin' || r.type === 'employee');
	const managerReviewRecipients = recipients.filter(r => r.type === 'admin' || r.type === 'manager');
	const seenEmails = new Set<string>();

	// Schedule appropriate emails based on type
	switch (type) {
		case 'start':
			// Admin reminder day before
			for (const recipient of adminRecipients) {
				await createScheduledEmail(appraisalCycle, recipient, 'appraisal_start_reminder_admin', dayBefore);
			}

			// All recipients day of
			// Avoid sending the same email address twice, even if recipient types differ
			for (const recipient of recipients) {
				const email = recipient.email?.toLowerCase().trim();
				if (!email || seenEmails.has(email)) continue;
				seenEmails.add(email);
				await createScheduledEmail(appraisalCycle, recipient, 'appraisal_start_reminder_all', dayOf);
			}
			break;

		case 'end':
			// Admin reminder day of
			for (const recipient of adminRecipients) {
				await createScheduledEmail(appraisalCycle, recipient, 'appraisal_end_reminder_admin', dayOf);
			}
			break;

		case 'self_review':
			// Admin and employee reminders
			for (const recipient of selfReviewRecipients) {
				await createScheduledEmail(appraisalCycle, recipient, 'self_review_reminder_day_before', dayBefore);
				await createScheduledEmail(appraisalCycle, recipient, 'self_review_reminder_day_of', dayOf);
			}
			break;

		case 'manager_review':
			// Admin and manager reminders
			for (const recipient of managerReviewRecipients) {
				await createScheduledEmail(appraisalCycle, recipient, 'manager_review_reminder_day_before', dayBefore);
				await createScheduledEmail(appraisalCycle, recipient, 'manager_review_reminder_day_of', dayOf);
			}
			break;
	}
}

/**
 * Create a scheduled email record
 */
async function createScheduledEmail(appraisalCycle: Tables<'appraisal_cycles'>, recipient: EmailRecipient, emailType: Database['public']['Enums']['appraisal_email_type'], scheduledDate: Date): Promise<void> {
	const scheduledFor = new Date(scheduledDate);
	scheduledFor.setHours(1, 0, 0, 0); // 1 AM

	const emailData = {
		to: recipient.email,
		subject: `Appraisal Reminder: ${appraisalCycle.name}`,
		body: `<h2>Appraisal Reminder</h2><p>Hello ${recipient.name},</p><p>This is a reminder about the appraisal cycle "${appraisalCycle.name}".</p>`,
		recipient_name: recipient.name,
		appraisal_name: appraisalCycle.name,
		start_date: appraisalCycle.start_date,
		end_date: appraisalCycle.end_date,
		self_review_due_date: appraisalCycle.self_review_due_date,
		manager_review_due_date: appraisalCycle.manager_review_due_date
	};

	const { error } = await supabase.from('appraisal_scheduled_emails').insert({
		org: appraisalCycle.org,
		appraisal_cycle: appraisalCycle.id,
		contract: recipient.type === 'employee' ? recipient.id : null,
		email_type: emailType,
		recipient_type: recipient.type,
		scheduled_for: scheduledFor.toISOString(),
		email_data: emailData,
		status: 'pending'
	});

	if (error) {
		console.error('Error creating scheduled email:', error);
		throw error;
	}
}

/**
 * Main cron handler
 */
Deno.serve(async (_req: Request) => {
	try {
		console.log('Starting appraisal email processor cron job...');

		const startTime = new Date();
		let totalProcessed = 0;
		let totalErrors = 0;

		// Process pending emails
		console.log('Processing pending emails...');
		const emailResults = await processPendingEmails();
		totalProcessed += emailResults.processed;
		totalErrors += emailResults.errors;

		// Process future notifications
		console.log('Processing future notifications...');
		const notificationResults = await processFutureNotifications();
		totalProcessed += notificationResults.processed;
		totalErrors += notificationResults.errors;

		const endTime = new Date();
		const duration = endTime.getTime() - startTime.getTime();

		const response = {
			message: 'Appraisal email processor completed',
			stats: {
				totalProcessed,
				totalErrors,
				duration: `${duration}ms`,
				timestamp: endTime.toISOString()
			}
		};

		console.log('Cron job completed:', response);

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Cron job error:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
});
