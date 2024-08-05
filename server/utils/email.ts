import nodemailer from 'nodemailer';

/**
 * Sends a task reminder email to the specified user.
 *
 * @param {Object} params - The parameters for sending the task reminder.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.projectId - The ID of the project.
 * @param {string} params.taskId - The ID of the task.
 * @throws {Error} - Throws an error if the email sending process fails.
 */
export async function sendTaskReminder({
  email,
  projectId,
  taskId,
}: {
  email: string;
  projectId: string;
  taskId: string;
}) {
  const domainBase = process.env.DOMAIN_BASE;
  try {
    // Construct the email content with a link to the task
    const content = `
      <p>Hey! You've been assigned a new task!</p>
      <a href="${domainBase}/project/${projectId}?selectedTask=${taskId}"> VIEW TASK </a>
    `;

    await sendEmail({ email, content });
  } catch (error) {
    console.error('Error sending task reminder:', error);
    throw new Error(
      'Unable to send task reminder email. Please try again later.'
    );
  }
}

/**
 * Sends an email with the specified content.
 *
 * @param {Object} params - The parameters for sending the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.content - The HTML content of the email.
 * @throws {Error} - Throws an error if the email sending process fails.
 */
async function sendEmail({
  email,
  content,
}: {
  email: string;
  content: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const options = {
    from: 'Frello',
    to: email,
    subject: 'Frello - Task Assigned',
    html: content,
  };

  try {
    await transporter.sendMail(options);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(
      'Unable to send email. Please check your email configuration and try again.'
    );
  }
}
