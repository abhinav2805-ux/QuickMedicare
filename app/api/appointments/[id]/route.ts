import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/mongodb'
import { decodeToken } from '@/lib/jwt'
import { sendAppointmentCancellation } from '@/lib/email'
import { ApiResponse, Appointment } from '@/lib/models'

async function getAuthenticatedUser(req: NextRequest): Promise<{ userId: string; email: string; name: string } | null> {
  const token = req.cookies.get('authToken')?.value
  if (token) {
    const decoded = decodeToken(token)
    if (decoded?.userId) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      }
    }
  }

  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (nextAuthToken?.sub && nextAuthToken?.email) {
    return {
      userId: nextAuthToken.sub,
      email: nextAuthToken.email,
      name: nextAuthToken.name || 'User',
    }
  }

  return null
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: appointmentId } = await context.params
    if (!ObjectId.isValid(appointmentId)) {
      return NextResponse.json({ success: false, message: 'Invalid appointment id' }, { status: 400 })
    }

    const body = await req.json()
    const { doctorName, specialization, appointmentDate, appointmentTime, reason, notes } = body

    if (!doctorName || !specialization || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'All fields are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const appointmentsCollection = db.collection('appointments')
    const existingAppointment = await appointmentsCollection.findOne({
      _id: new ObjectId(appointmentId),
      userId: new ObjectId(user.userId),
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      )
    }

    await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId), userId: new ObjectId(user.userId) },
      {
        $set: {
          doctorName,
          specialization,
          appointmentDate,
          appointmentTime,
          reason,
          notes,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment updated successfully',
        data: {
          _id: appointmentId,
          userId: user.userId,
          doctorName,
          specialization,
          appointmentDate,
          appointmentTime,
          reason,
          notes,
          status: existingAppointment.status,
          createdAt: existingAppointment.createdAt,
          updatedAt: new Date(),
        } satisfies Appointment,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Update appointment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: appointmentId } = await context.params
    if (!ObjectId.isValid(appointmentId)) {
      return NextResponse.json({ success: false, message: 'Invalid appointment id' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const appointmentsCollection = db.collection('appointments')

    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(appointmentId),
      userId: new ObjectId(user.userId),
    })

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      )
    }

    const deletionResult = await appointmentsCollection.deleteOne({
      _id: new ObjectId(appointmentId),
      userId: new ObjectId(user.userId),
    })

    if (deletionResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      )
    }

    await sendAppointmentCancellation(user.email, user.name, {
      doctorName: appointment.doctorName,
      specialization: appointment.specialization,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      reason: appointment.reason,
    }).catch(error => {
      console.error('[v0] Appointment cancellation email error:', error)
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment cancelled successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Delete appointment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}