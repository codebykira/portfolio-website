import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Get the API key from server runtime config
const resendApiKey = process.env.RESEND_API_KEY || '';

// Initialize Resend with API key from environment variables
const resend = new Resend(resendApiKey);

// Validate required environment variables
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not set in environment variables');
  throw new Error('Email service is not properly configured');
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const { name, email, message } = await request.json();
    
    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: 'kiracheung0211@gmail.com',
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Contact Form Submission</h2>
          <div style="background-color: #fff8f1; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 10px; border-radius: 4px; margin-top: 8px; border: 1px solid #f3f4f6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 0.875rem;">
            This message was sent from your portfolio contact form.
          </p>
        </div>
      `,
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later or contact me directly at kiracheung0211@gmail.com',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
