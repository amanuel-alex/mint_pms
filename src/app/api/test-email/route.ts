import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("Testing email configuration:");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_FROM:", process.env.SMTP_FROM);
    console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "***SET***" : "NOT SET");

    const testEmailTemplate = `
      <html>
        <body>
          <h1>Test Email</h1>
          <p>This is a test email to verify your email configuration is working.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `;

    const result = await sendEmail({
      to: email,
      subject: "Test Email - Project Management System",
      html: testEmailTemplate,
    });

    console.log("Email test result:", result);

    if (result.success) {
      return NextResponse.json({ 
        message: "Test email sent successfully!",
        result 
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to send test email",
        details: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ 
      error: "Test email failed",
      details: error 
    }, { status: 500 });
  }
} 