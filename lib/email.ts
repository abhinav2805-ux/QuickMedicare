import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

export async function sendAppointmentConfirmation(
  email: string,
  name: string,
  appointmentDetails: {
    doctorName: string
    specialization: string
    appointmentDate: string
    appointmentTime: string
  }
) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Appointment Confirmation - QuickMedicare Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="background-color: #0969a2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 28px;">Appointment Confirmed</h2>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi ${name},</p>
          <p>Your appointment has been successfully booked with QuickMedicare Solutions.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #0969a2; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #0969a2;">Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
            <p><strong>Specialization:</strong> ${appointmentDetails.specialization}</p>
            <p><strong>Date:</strong> ${appointmentDetails.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentDetails.appointmentTime}</p>
          </div>

          <h3 style="color: #0969a2; margin-top: 30px;">Important Reminders</h3>
          <ul style="color: #666;">
            <li>Please arrive 15 minutes before your appointment</li>
            <li>Bring your insurance card and valid ID</li>
            <li>Keep a list of your current medications</li>
            <li>Note any allergies or medical conditions</li>
          </ul>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you need to reschedule or cancel, please log into your account or contact us at least 24 hours before your appointment.
          </p>

          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #0369a1;"><strong>Need help?</strong></p>
            <p style="margin: 5px 0 0 0; color: #0369a1; font-size: 14px;">Contact us: info@quickmedicare.com | +1 (800) 123-4567</p>
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            © 2026 QuickMedicare Solutions. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('[v0] Confirmation email sent to:', email)
  } catch (error) {
    console.error('[v0] Email send error:', error)
  }
}

export async function sendAppointmentCancellation(
  email: string,
  name: string,
  appointmentDetails: {
    doctorName: string
    specialization: string
    appointmentDate: string
    appointmentTime: string
    reason?: string
  }
) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Appointment Cancelled - QuickMedicare Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="background-color: #c41c3b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 28px;">Appointment Cancelled</h2>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi ${name},</p>
          <p>Your appointment has been successfully cancelled.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #c41c3b; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #c41c3b;">Cancelled Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
            <p><strong>Specialization:</strong> ${appointmentDetails.specialization}</p>
            <p><strong>Date:</strong> ${appointmentDetails.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentDetails.appointmentTime}</p>
            ${appointmentDetails.reason ? `<p><strong>Reason:</strong> ${appointmentDetails.reason}</p>` : ''}
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If this cancellation was not intended, please book a new appointment from your dashboard.
          </p>

          <div style="background-color: #fff1f2; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #9f1239;"><strong>Need help?</strong></p>
            <p style="margin: 5px 0 0 0; color: #9f1239; font-size: 14px;">Contact us: info@quickmedicare.com | +1 (800) 123-4567</p>
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            © 2026 QuickMedicare Solutions. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('[v0] Cancellation email sent to:', email)
  } catch (error) {
    console.error('[v0] Cancellation email error:', error)
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Welcome to QuickMedicare Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #0969a2 0%, #c41c3b 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to QuickMedicare</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">From Critical Care to Home Care</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi ${name},</p>
          <p>Thank you for joining QuickMedicare Solutions! We&apos;re excited to help you access the healthcare services you need.</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #047857;">What You Can Do</h3>
            <ul style="color: #065f46;">
              <li>Book appointments with experienced healthcare professionals</li>
              <li>Access telemedicine consultations from home</li>
              <li>Manage your medical appointments in one place</li>
              <li>Receive professional healthcare at critical and home care levels</li>
            </ul>
          </div>

          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #0969a2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Go to Your Dashboard
            </a>
          </p>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
          </p>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #0369a1;"><strong>Support</strong></p>
            <p style="margin: 5px 0 0 0; color: #0369a1; font-size: 14px;">Email: info@quickmedicare.com | Phone: +1 (800) 123-4567</p>
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            © 2026 QuickMedicare Solutions. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('[v0] Welcome email sent to:', email)
  } catch (error) {
    console.error('[v0] Email send error:', error)
  }
}
