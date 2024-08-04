import nodemailer from 'nodemailer';

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
    const content = `
                    <p>Hey! You've been assigned a new task!</p>
                    <a href="${domainBase}/project/${projectId}?selectedTask=${taskId}"> VIEW TASK </a>
                    `;

    await sendEmail({ email, content });
  } catch (error) {
    throw error;
  }
}

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

  const options = {
    from: 'Frello',
    to: email,
    subject: 'Frello - Task Assigned',
    html: content,
  };

  try {
    await transporter.sendMail(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
