import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use custom FROM_EMAIL from .env or default to resend.dev for testing
// For production, set FROM_EMAIL in .env to your verified domain email
// Example: FROM_EMAIL=BOSS Barbershop <noreply@yourdomain.com>
const FROM_EMAIL = process.env.FROM_EMAIL || 'BOSS Barbershop <onboarding@resend.dev>';

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - BOSS Barbershop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">BOSS</h1>
                      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">BARBERSHOP</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 10px; color: #000000; font-size: 22px; font-weight: 600;">Welcome, ${name}!</h2>
                      <p style="margin: 0 0 25px; color: #666666; font-size: 15px; line-height: 1.6;">
                        Thanks for signing up. Please verify your email address to complete your registration and access all features.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 25px;">
                            <a href="${verificationUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 35px; border-radius: 10px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 15px; color: #999999; font-size: 13px; line-height: 1.5;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 25px; color: #666666; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 8px;">
                        ${verificationUrl}
                      </p>
                      
                      <p style="margin: 0; color: #999999; font-size: 13px;">
                        This link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 25px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error };
    }

    console.log('Verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to BOSS Barbershop!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">BOSS</h1>
                      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">BARBERSHOP</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px; text-align: center;">
                      <div style="width: 60px; height: 60px; background-color: #e8f5e9; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 30px;">✓</span>
                      </div>
                      <h2 style="margin: 0 0 10px; color: #000000; font-size: 22px; font-weight: 600;">You're all set!</h2>
                      <p style="margin: 0 0 25px; color: #666666; font-size: 15px; line-height: 1.6;">
                        Your email has been verified. You can now book appointments, view your history, and manage your profile.
                      </p>
                      
                      <!-- Button -->
                      <a href="${process.env.FRONTEND_URL}/booking" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 35px; border-radius: 10px;">
                        Book Your First Appointment
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 25px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        Thank you for choosing BOSS Barbershop!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Send booking notification to barber
 */
export const sendBookingNotificationToBarber = async (barberEmail, barberName, bookingDetails) => {
  const { customerName, customerPhone, serviceName, date, time, price } = bookingDetails;
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: barberEmail,
      subject: `New Booking - ${formattedDate} at ${time}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">BOSS</h1>
                      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">BARBERSHOP</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 10px; color: #000000; font-size: 22px; font-weight: 600;">New Booking!</h2>
                      <p style="margin: 0 0 25px; color: #666666; font-size: 15px; line-height: 1.6;">
                        Hey ${barberName}, you have a new appointment scheduled.
                      </p>
                      
                      <!-- Booking Details Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <tr>
                          <td>
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">${customerName}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
                                <td style="color: #000000; font-size: 15px; text-align: right;">${customerPhone || 'Not provided'}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Service</td>
                                <td style="color: #000000; font-size: 15px; text-align: right;">${serviceName}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</td>
                                <td style="color: #000000; font-size: 15px; text-align: right;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">${time}</td>
                              </tr>
                              ${price ? `
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">$${price}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${process.env.FRONTEND_URL}/barber/bookings" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 35px; border-radius: 10px;">
                              View All Bookings
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 25px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        This is an automated notification from BOSS Barbershop.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send booking notification:', error);
      return { success: false, error };
    }

    console.log('Booking notification sent to barber:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending booking notification:', error);
    return { success: false, error };
  }
};

/**
 * Send booking confirmation to customer
 */
export const sendBookingConfirmationToCustomer = async (customerEmail, customerName, bookingDetails) => {
  const { barberName, serviceName, date, time, price } = bookingDetails;
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Booking Confirmed - ${formattedDate} at ${time}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">BOSS</h1>
                      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">BARBERSHOP</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 25px;">
                        <div style="width: 60px; height: 60px; background-color: #e8f5e9; border-radius: 50%; margin: 0 auto 15px; line-height: 60px;">
                          <span style="font-size: 30px;">✓</span>
                        </div>
                        <h2 style="margin: 0 0 10px; color: #000000; font-size: 22px; font-weight: 600;">Booking Confirmed!</h2>
                        <p style="margin: 0; color: #666666; font-size: 15px;">
                          Thanks ${customerName}, your appointment is confirmed.
                        </p>
                      </div>
                      
                      <!-- Booking Details Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <tr>
                          <td>
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Barber</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">${barberName}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Service</td>
                                <td style="color: #000000; font-size: 15px; text-align: right;">${serviceName}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</td>
                                <td style="color: #000000; font-size: 15px; text-align: right;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">${time}</td>
                              </tr>
                              ${price ? `
                              <tr>
                                <td style="color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</td>
                                <td style="color: #000000; font-size: 15px; font-weight: 600; text-align: right;">$${price}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Please arrive 5 minutes before your scheduled time.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${process.env.FRONTEND_URL}/profile" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 35px; border-radius: 10px;">
                              View My Bookings
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 25px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        Need to cancel or reschedule? Contact us directly.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send booking confirmation:', error);
      return { success: false, error };
    }

    console.log('Booking confirmation sent to customer:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return { success: false, error };
  }
};

export default resend;
