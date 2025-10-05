import { createClient } from '@/utils/supabase/server';
import { addDays, subDays, isWithinInterval, addHours } from 'date-fns';
import { Database, Tables } from '@/type/database.types';

type AppraisalCycle = Tables<'appraisal_cycles'>;
type ScheduledEmail = Database['public']['Tables']['appraisal_scheduled_emails']['Insert'];

interface EmailRecipient {
	id: number;
	email: string;
	name: string;
	type: 'admin' | 'employee' | 'manager';
}

interface EmailTemplate {
	subject: string;
	body: string;
	type: Database['public']['Enums']['appraisal_email_type'];
	recipientType: Database['public']['Enums']['recipient_type'];
}

export class AppraisalEmailScheduler {
	private supabase = createClient();

	/**
	 * Schedule all necessary emails for an appraisal cycle
	 */
	async scheduleAppraisalEmails(appraisalCycle: AppraisalCycle): Promise<void> {
		try {
			const now = new Date();
			const thirtyDaysFromNow = addDays(now, 30);

			// Get recipients for this appraisal cycle
			const recipients = await this.getRecipients(appraisalCycle);

			// Check if dates are within 30 days and schedule emails accordingly
			await this.scheduleStartDateEmails(appraisalCycle, recipients, now, thirtyDaysFromNow);
			await this.scheduleDueDateEmails(appraisalCycle, recipients, now, thirtyDaysFromNow);
			await this.scheduleEndDateEmails(appraisalCycle, recipients, now, thirtyDaysFromNow);

			// // If any dates are beyond 30 days, create notification records for future processing
			await this.createFutureNotifications(appraisalCycle, thirtyDaysFromNow);
		} catch (error) {
			console.error('Error scheduling appraisal emails:', error);
			throw error;
		}
	}

	/**
	 * Schedule emails for appraisal start date
	 */
	private async scheduleStartDateEmails(appraisalCycle: AppraisalCycle, recipients: EmailRecipient[], now: Date, thirtyDaysFromNow: Date): Promise<void> {
		const startDate = new Date(appraisalCycle.start_date);

		if (isWithinInterval(startDate, { start: now, end: thirtyDaysFromNow })) {
			const dayBeforeStart = subDays(startDate, 1);
			const dayOfStart = startDate;

			// Schedule admin reminder for day before start (1 AM)
			const adminDayBefore = addHours(dayBeforeStart, 1);
			const adminRecipients = recipients.filter(r => r.type === 'admin');

			for (const recipient of adminRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Appraisal Cycle Starting Tomorrow: ${appraisalCycle.name}`,
					body: this.getStartReminderBody(appraisalCycle, recipient, 'day_before'),
					type: 'appraisal_start_reminder_admin',
					recipientType: 'admin'
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: adminDayBefore.toISOString()
				});
			}

			// Schedule reminders for all recipients on start date (1 AM)
			const allDayOfStart = addHours(dayOfStart, 1);

			for (const recipient of recipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Appraisal Cycle Starting Today: ${appraisalCycle.name}`,
					body: this.getStartReminderBody(appraisalCycle, recipient, 'day_of'),
					type: 'appraisal_start_reminder_all',
					recipientType: recipient.type as Database['public']['Enums']['recipient_type']
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: allDayOfStart.toISOString()
				});
			}
		}
	}

	/**
	 * Schedule emails for self review and manager review due dates
	 */
	private async scheduleDueDateEmails(appraisalCycle: AppraisalCycle, recipients: EmailRecipient[], now: Date, thirtyDaysFromNow: Date): Promise<void> {
		// Self review due date emails
		const selfReviewDueDate = new Date(appraisalCycle.self_review_due_date);

		if (isWithinInterval(selfReviewDueDate, { start: now, end: thirtyDaysFromNow })) {
			const dayBeforeSelfReview = subDays(selfReviewDueDate, 1);
			const dayOfSelfReview = selfReviewDueDate;

			// Schedule day before self review reminders (1 AM)
			const dayBeforeTime = addHours(dayBeforeSelfReview, 1);
			const selfReviewRecipients = recipients.filter(r => r.type === 'admin' || r.type === 'employee');

			for (const recipient of selfReviewRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Self Review Due Tomorrow: ${appraisalCycle.name}`,
					body: this.getDueDateReminderBody(appraisalCycle, recipient, 'self_review', 'day_before'),
					type: 'self_review_reminder_day_before',
					recipientType: recipient.type as Database['public']['Enums']['recipient_type']
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: dayBeforeTime.toISOString()
				});
			}

			// Schedule day of self review reminders (1 AM)
			const dayOfTime = addHours(dayOfSelfReview, 1);

			for (const recipient of selfReviewRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Self Review Due Today: ${appraisalCycle.name}`,
					body: this.getDueDateReminderBody(appraisalCycle, recipient, 'self_review', 'day_of'),
					type: 'self_review_reminder_day_of',
					recipientType: recipient.type as Database['public']['Enums']['recipient_type']
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: dayOfTime.toISOString()
				});
			}
		}

		// Manager review due date emails
		const managerReviewDueDate = new Date(appraisalCycle.manager_review_due_date);

		if (isWithinInterval(managerReviewDueDate, { start: now, end: thirtyDaysFromNow })) {
			const dayBeforeManagerReview = subDays(managerReviewDueDate, 1);
			const dayOfManagerReview = managerReviewDueDate;

			// Schedule day before manager review reminders (1 AM)
			const dayBeforeTime = addHours(dayBeforeManagerReview, 1);
			const managerReviewRecipients = recipients.filter(r => r.type === 'admin' || r.type === 'manager');

			for (const recipient of managerReviewRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Manager Review Due Tomorrow: ${appraisalCycle.name}`,
					body: this.getDueDateReminderBody(appraisalCycle, recipient, 'manager_review', 'day_before'),
					type: 'manager_review_reminder_day_before',
					recipientType: recipient.type as Database['public']['Enums']['recipient_type']
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: dayBeforeTime.toISOString()
				});
			}

			// Schedule day of manager review reminders (1 AM)
			const dayOfTime = addHours(dayOfManagerReview, 1);

			for (const recipient of managerReviewRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Manager Review Due Today: ${appraisalCycle.name}`,
					body: this.getDueDateReminderBody(appraisalCycle, recipient, 'manager_review', 'day_of'),
					type: 'manager_review_reminder_day_of',
					recipientType: recipient.type as Database['public']['Enums']['recipient_type']
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: dayOfTime.toISOString()
				});
			}
		}
	}

	/**
	 * Schedule emails for appraisal end date
	 */
	private async scheduleEndDateEmails(appraisalCycle: AppraisalCycle, recipients: EmailRecipient[], now: Date, thirtyDaysFromNow: Date): Promise<void> {
		const endDate = new Date(appraisalCycle.end_date);

		if (isWithinInterval(endDate, { start: now, end: thirtyDaysFromNow })) {
			const endTime = addHours(endDate, 1);
			const adminRecipients = recipients.filter(r => r.type === 'admin');

			for (const recipient of adminRecipients) {
				const emailData = this.createEmailData(appraisalCycle, recipient, {
					subject: `Appraisal Cycle Ending Today: ${appraisalCycle.name}`,
					body: this.getEndReminderBody(appraisalCycle, recipient),
					type: 'appraisal_end_reminder_admin',
					recipientType: 'admin'
				});

				await this.insertScheduledEmail({
					...emailData,
					scheduled_for: endTime.toISOString()
				});
			}
		}
	}

	/**
	 * Create notification records for dates beyond 30 days
	 */
	private async createFutureNotifications(appraisalCycle: AppraisalCycle, thirtyDaysFromNow: Date): Promise<void> {
		const startDate = new Date(appraisalCycle.start_date);
		const endDate = new Date(appraisalCycle.end_date);
		const selfReviewDueDate = new Date(appraisalCycle.self_review_due_date);
		const managerReviewDueDate = new Date(appraisalCycle.manager_review_due_date);

		const futureDates = [startDate, endDate, selfReviewDueDate, managerReviewDueDate].filter(date => date > thirtyDaysFromNow);

		if (futureDates.length > 0) {
			await (await this.supabase).from('appraisal_email_notifications').insert({
				org: appraisalCycle.org,
				appraisal_cycle: appraisalCycle.id,
				contract: appraisalCycle.employee,
				notification_config: {
					action: 'schedule_future',
					dates: {
						start_date: appraisalCycle.start_date,
						end_date: appraisalCycle.end_date,
						self_review_due_date: appraisalCycle.self_review_due_date,
						manager_review_due_date: appraisalCycle.manager_review_due_date
					}
				},
				is_active: true
			});
		}
	}

	/**
	 * Get recipients for an appraisal cycle
	 */
	private async getRecipients(appraisalCycle: AppraisalCycle): Promise<EmailRecipient[]> {
		const recipients: EmailRecipient[] = [];
		const supabase = await this.supabase;

		// Get admins
		const { data: admins } = await supabase.from('profiles_roles').select('id, profile!inner(id, first_name, last_name, email)').match({ organisation: appraisalCycle.org, role: 'admin', disable: false });

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

		// If appraisal is for a specific employee, get that employee and their manager
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
	 * Create email data for a scheduled email
	 */
	private createEmailData(appraisalCycle: AppraisalCycle, recipient: EmailRecipient, template: EmailTemplate): Omit<ScheduledEmail, 'scheduled_for'> {
		return {
			org: appraisalCycle.org,
			appraisal_cycle: appraisalCycle.id,
			contract: recipient.type === 'employee' ? recipient.id : null,
			email_type: template.type,
			recipient_type: template.recipientType,
			email_data: {
				to: recipient.email,
				subject: template.subject,
				body: template.body,
				recipient_name: recipient.name,
				appraisal_name: appraisalCycle.name,
				appraisal_description: appraisalCycle.description,
				start_date: appraisalCycle.start_date,
				end_date: appraisalCycle.end_date,
				self_review_due_date: appraisalCycle.self_review_due_date,
				manager_review_due_date: appraisalCycle.manager_review_due_date
			},
			status: 'pending'
		};
	}

	/**
	 * Insert a scheduled email record
	 */
	private async insertScheduledEmail(emailData: ScheduledEmail): Promise<void> {
		const { error } = await (await this.supabase).from('appraisal_scheduled_emails').insert(emailData);

		if (error) {
			console.error('Error inserting scheduled email:', error);
			throw error;
		}
	}

	/**
	 * Get email body for start reminder
	 */
	private getStartReminderBody(appraisalCycle: AppraisalCycle, recipient: EmailRecipient, timing: 'day_before' | 'day_of'): string {
		const timingText = timing === 'day_before' ? 'tomorrow' : 'today';
		const actionText = timing === 'day_before' ? 'starts' : 'starts';

		return `
      <h2>Appraisal Cycle Reminder</h2>
      <p>Hello ${recipient.name},</p>
      <p>The appraisal cycle "${appraisalCycle.name}" ${actionText} ${timingText}.</p>
      ${appraisalCycle.description ? `<p><strong>Description:</strong> ${appraisalCycle.description}</p>` : ''}
      <p><strong>Start Date:</strong> ${new Date(appraisalCycle.start_date).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> ${new Date(appraisalCycle.end_date).toLocaleDateString()}</p>
      <p><strong>Self Review Due:</strong> ${new Date(appraisalCycle.self_review_due_date).toLocaleDateString()}</p>
      <p><strong>Manager Review Due:</strong> ${new Date(appraisalCycle.manager_review_due_date).toLocaleDateString()}</p>
      <p>Please ensure you're prepared for the upcoming appraisal cycle.</p>
    `;
	}

	/**
	 * Get email body for due date reminder
	 */
	private getDueDateReminderBody(appraisalCycle: AppraisalCycle, recipient: EmailRecipient, reviewType: 'self_review' | 'manager_review', timing: 'day_before' | 'day_of'): string {
		const timingText = timing === 'day_before' ? 'tomorrow' : 'today';
		const reviewTypeText = reviewType === 'self_review' ? 'self review' : 'manager review';
		const actionText = timing === 'day_before' ? 'is due' : 'is due';

		return `
      <h2>${reviewTypeText.charAt(0).toUpperCase() + reviewTypeText.slice(1)} Reminder</h2>
      <p>Hello ${recipient.name},</p>
      <p>The ${reviewTypeText} for appraisal cycle "${appraisalCycle.name}" ${actionText} ${timingText}.</p>
      ${appraisalCycle.description ? `<p><strong>Description:</strong> ${appraisalCycle.description}</p>` : ''}
      <p><strong>Due Date:</strong> ${new Date(reviewType === 'self_review' ? appraisalCycle.self_review_due_date : appraisalCycle.manager_review_due_date).toLocaleDateString()}</p>
      <p>Please ensure you complete your ${reviewTypeText} on time.</p>
    `;
	}

	/**
	 * Get email body for end reminder
	 */
	private getEndReminderBody(appraisalCycle: AppraisalCycle, recipient: EmailRecipient): string {
		return `
      <h2>Appraisal Cycle Ending</h2>
      <p>Hello ${recipient.name},</p>
      <p>The appraisal cycle "${appraisalCycle.name}" ends today.</p>
      ${appraisalCycle.description ? `<p><strong>Description:</strong> ${appraisalCycle.description}</p>` : ''}
      <p><strong>End Date:</strong> ${new Date(appraisalCycle.end_date).toLocaleDateString()}</p>
      <p>Please ensure all reviews are completed before the cycle ends.</p>
    `;
	}

	/**
	 * Reschedule emails when appraisal cycle dates are updated
	 */
	async rescheduleAppraisalEmails(appraisalCycle: AppraisalCycle): Promise<void> {
		try {
			// Cancel all pending/scheduled emails for this cycle
			await (await this.supabase).from('appraisal_scheduled_emails').update({ status: 'cancelled' }).eq('appraisal_cycle_id', appraisalCycle.id).in('status', ['pending', 'scheduled']);

			// Schedule new emails with updated dates
			await this.scheduleAppraisalEmails(appraisalCycle);
		} catch (error) {
			console.error('Error rescheduling appraisal emails:', error);
			throw error;
		}
	}
}
