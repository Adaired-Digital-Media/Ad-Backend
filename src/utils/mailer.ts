import nodemailer from "nodemailer";

/**
 * Send an email using the configured transporter.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param html - The HTML content of the email.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email provider's service
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
