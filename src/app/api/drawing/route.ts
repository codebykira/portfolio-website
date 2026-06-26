import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set');
    return null;
  }
  return new Resend(apiKey);
};

const resend = getResendClient();

const PNG_PREFIX = 'data:image/png;base64,';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    // Validate: must be a PNG data URL
    if (typeof image !== 'string' || !image.startsWith(PNG_PREFIX)) {
      return NextResponse.json(
        { error: 'A PNG data URL is required' },
        { status: 400 }
      );
    }

    const base64 = image.slice(PNG_PREFIX.length);

    // Guard against absurdly large payloads (~6MB of base64)
    if (base64.length > 6_000_000) {
      return NextResponse.json({ error: 'Drawing too large' }, { status: 413 });
    }

    if (!resend) {
      console.log('Drawing received but Resend API key is not configured');
      return NextResponse.json({
        success: true,
        message: 'Drawing received (but email not sent due to missing API key)',
      });
    }

    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: 'kiracheung0211@gmail.com',
      subject: 'Someone left you a note ✏️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Someone drew in your notebook</h2>
          <p style="color: #374151;">A visitor left you a doodle on your portfolio. It's attached as a PNG.</p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 0.875rem;">
            Sent from the notebook on your portfolio hero.
          </p>
        </div>
      `,
      text: "Someone drew in your portfolio notebook. The doodle is attached as a PNG.",
      attachments: [{ filename: 'note.png', content: base64 }],
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error sending drawing email:', error);
    return NextResponse.json(
      { error: 'Failed to send drawing.' },
      { status: 500 }
    );
  }
}
